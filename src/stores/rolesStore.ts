// stores/rolesStore.ts
import { create } from 'zustand';
import type { Rol } from '@/types/rol';

interface RolesStore {
    roles: Rol[];
    setRoles: (roles: Rol[]) => void;
    addRol: (rol: Rol) => void;
    updateRol: (id: number, updatedRol: Rol) => void;
}

export const useRolesStore = create<RolesStore>((set) => ({
    roles: [],
    setRoles: (roles) => set({ roles }),
    addRol: (rol) => set((state) => ({ roles: [rol, ...state.roles] })),
    updateRol: (id, updatedRol) =>
        set((state) => ({
            roles: state.roles.map((rol) => (rol.id_rol_usuario === id ? updatedRol : rol)),
        })),
}));