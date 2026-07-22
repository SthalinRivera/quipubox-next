// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModuloPermitido } from '@/types/configuracion';

interface AuthState {
    user: any | null;
    roles: string[];
    modulos: ModuloPermitido[];
    isLoading: boolean;
    isLoggingOut: boolean;
    setUser: (user: any) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
    setLoggingOut: (loggingOut: boolean) => void;
    hasRole: (role: string | string[]) => boolean;
    hasModulo: (ruta: string) => boolean;
    getModulosByCategoria: (categoriaNombre: string) => ModuloPermitido[];
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            roles: [],
            modulos: [],
            isLoading: true,
            isLoggingOut: false,

            setUser: (user) => {
                const roles = user?.roles?.map((r: any) => r.nombre || r) || [];
                const modulos = user?.modulos || [];
                set({
                    user,
                    roles,
                    modulos,
                    isLoading: false,
                    isLoggingOut: false,
                });
            },

            clearUser: () => {
                set({ user: null, roles: [], modulos: [], isLoading: false, isLoggingOut: false });
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            setLoggingOut: (loggingOut) => {
                set({ isLoggingOut: loggingOut });
            },

            hasRole: (requiredRoles) => {
                const roles = get().roles;
                const required = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
                return required.some(role => roles.includes(role));
            },

            hasModulo: (ruta) => {
                const modulos = get().modulos;
                return modulos.some((m) => m.ruta === ruta && m.estado);
            },

            getModulosByCategoria: (categoriaNombre) => {
                const modulos = get().modulos;
                return modulos.filter(
                    (m) => m.categoria.nombre === categoriaNombre && m.estado
                ).sort((a, b) => (a.orden || 0) - (b.orden || 0));
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                roles: state.roles,
                modulos: state.modulos,
            }),
        }
    )
);
