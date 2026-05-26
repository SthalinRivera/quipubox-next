'use client'

import { createClient } from '@/lib/supabase/client'
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/api-client'

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
            return profile
        } catch (error) {
            console.error('fetchUser error:', error)
            setUser(null)
            return null
        }
    }

    const restoreSession = async () => {
        setLoading(true)

        if (!supabase) {
            console.warn('Supabase no está disponible en este entorno')
            setUser(null)
            setLoading(false)
            return
        }

        try {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession()

            if (error) {
                console.error('Supabase getSession error:', error)
                setUser(null)
            } else if (session?.access_token) {
                await fetchUser(session.access_token)
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error('restoreSession error:', error)
            setUser(null)
        } finally {
            setLoading(false)
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
        if (!supabase) {
            console.error('Supabase no está disponible para logout')
            setUser(null)
            router.push('/signin')
            return
        }

        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error('logout error:', error)
        } finally {
            setUser(null)
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
                    await fetchUser(session.access_token);
                    // Only redirect to dashboard if we are on the sign‑in or root page
                    if (['/', '/signin', '/auth/callback'].includes(pathname)) {
                        router.push('/dashboard');
                    }
                }
                if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
                if (event === 'TOKEN_REFRESHED' && session) {
                    await fetchUser(session.access_token);
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