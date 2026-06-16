// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: any | null;
    roles: string[];
    isLoading: boolean;
    setUser: (user: any) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
    hasRole: (role: string | string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            roles: [],
            isLoading: true, // comienza cargando

            setUser: (user) => {
                const roles = user?.roles?.map((r: any) => r.nombre || r) || [];
                set({
                    user,
                    roles,
                    isLoading: false,
                });
            },

            clearUser: () => {
                set({ user: null, roles: [], isLoading: false });
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            hasRole: (requiredRoles) => {
                const roles = get().roles;
                const required = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
                return required.some(role => roles.includes(role));
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                roles: state.roles,
                // no persistimos isLoading, solo el user y roles
            }),
        }
    )
);