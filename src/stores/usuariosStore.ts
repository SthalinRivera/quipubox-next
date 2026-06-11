// stores/usuariosStore.ts
import { create } from 'zustand';
import type { Usuario } from '@/types/usuario';

interface UsuariosStore {
    usuarios: Usuario[];
    setUsuarios: (usuarios: Usuario[]) => void;
    updateUsuario: (id: number, updated: Usuario) => void;
    removeUsuario: (id: number) => void;
}

export const useUsuariosStore = create<UsuariosStore>((set) => ({
    usuarios: [],
    setUsuarios: (usuarios) => set({ usuarios }),
    updateUsuario: (id, updated) =>
        set((state) => ({
            usuarios: state.usuarios.map((u) => (u.id_usuario === id ? updated : u)),
        })),
    removeUsuario: (id) =>
        set((state) => ({
            usuarios: state.usuarios.filter((u) => u.id_usuario !== id),
        })),
}));