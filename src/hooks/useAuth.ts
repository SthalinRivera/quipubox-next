'use client'

import { createClient } from '@/lib/supabase/client'
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/api-client'
import { useAuthStore } from '@/stores/authStore';

let sessionRestorePromise: Promise<any> | null = null;

export const useAuth = () => {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter();
    const pathname = usePathname();
    const supabase = typeof window !== 'undefined' ? createClient() : null

    const fetchUser = async (token: string) => {
        try {
            const profile = await fetchWithAuth('/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setUser(profile)
            useAuthStore.getState().setUser(profile); // <- guardar en store

            return profile
        } catch (error) {
            console.error('fetchUser error:', error)
            setUser(null)
            useAuthStore.getState().clearUser();
            return null
        }
    }

    const restoreSession = async () => {
        if (sessionRestorePromise) {
            try {
                const profile = await sessionRestorePromise;
                setUser(profile);
            } catch (err) {
                setUser(null);
            }
            setLoading(false);
            return;
        }

        setLoading(true);

        sessionRestorePromise = (async () => {
            if (!supabase) {
                console.warn('Supabase no está disponible en este entorno')
                setUser(null)
                useAuthStore.getState().clearUser();
                setLoading(false)
                return null;
            }

            try {
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession()

                if (error) {
                    console.error('Supabase getSession error:', error)
                    setUser(null)
                    useAuthStore.getState().clearUser();
                    return null;
                } else if (session?.access_token) {
                    const profile = await fetchUser(session.access_token)
                    return profile;
                } else {
                    setUser(null)
                    useAuthStore.getState().clearUser();
                    return null;
                }
            } catch (error) {
                console.error('restoreSession error:', error)
                setUser(null)
                useAuthStore.getState().clearUser();
                return null;
            } finally {
                setLoading(false);
            }
        })();

        try {
            const profile = await sessionRestorePromise;
            setUser(profile);
        } catch (err) {
            setUser(null);
        }
    }

    const loginWithGoogle = async () => {
        setLoading(true)

        if (!supabase) {
            console.error('Supabase no está disponible para login')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                console.error('Google login error:', error)
                throw error
            }
        } catch (error) {
            console.error('loginWithGoogle error:', error)
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        useAuthStore.getState().setLoggingOut(true);
        if (!supabase) {
            console.error('Supabase no está disponible para logout')
            setUser(null)
            useAuthStore.getState().clearUser();
            router.push('/signin')
            return
        }

        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error('logout error:', error)
        } finally {
            setUser(null)
            sessionRestorePromise = null;
            useAuthStore.getState().clearUser();
            router.push('/signin')
        }
    }

    useEffect(() => {
        if (!supabase) {
            restoreSession()
            return
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    const profilePromise = fetchUser(session.access_token);
                    sessionRestorePromise = profilePromise;
                    await profilePromise;
                    // Only redirect to dashboard if we are on the sign‑in or root page
                    if (['/', '/signin', '/auth/callback'].includes(pathname)) {
                        router.push('/dashboard');
                    }
                }
                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    sessionRestorePromise = null;
                    useAuthStore.getState().clearUser();
                }
                if (event === 'TOKEN_REFRESHED' && session) {
                    const profilePromise = fetchUser(session.access_token);
                    sessionRestorePromise = profilePromise;
                    await profilePromise;
                }
            }
        )

        restoreSession()

        return () => subscription.unsubscribe()
    }, [])

    const isAuthenticated = !!user

    return {
        user,
        loading,
        isAuthenticated,
        loginWithGoogle,
        logout,
        restoreSession,
    }
}