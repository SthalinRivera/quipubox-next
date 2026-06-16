// stores/clientesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Cliente } from '@/types/cliente';
interface ClientesUIState {
    // Filtros y paginación
    page: number;
    search: string;
    estado: boolean | 'todos';
    tipo_relacion: string;
    // Acciones
    setPage: (page: number) => void;
    setSearch: (search: string) => void;
    setEstado: (estado: boolean | 'todos') => void;
    setTipoRelacion: (tipo: string) => void;
    resetFilters: () => void;
}

export const useClientesUIStore = create<ClientesUIState>()(
    persist(
        (set) => ({
            page: 1,
            search: '',
            estado: 'todos',
            tipo_relacion: 'todos',
            setPage: (page) => set({ page }),
            setSearch: (search) => set({ search, page: 1 }), // resetear página al buscar
            setEstado: (estado) => set({ estado, page: 1 }), // resetear página al filtrar
            setTipoRelacion: (tipo) => set({ tipo_relacion: tipo, page: 1 }),
            resetFilters: () => set({ search: '', estado: 'todos', tipo_relacion: 'todos', page: 1 }),

        }),
        {
            name: 'clientes-filters', // clave en localStorage
            partialize: (state) => ({ search: state.search, estado: state.estado, tipo_relacion: state.tipo_relacion }), // persistir solo filtros
        }
    )
);



interface ClientesStore {
    clientes: Cliente[];
    setClientes: (clientes: Cliente[]) => void;
    addCliente: (cliente: Cliente) => void;
    updateCliente: (id: number, updatedCliente: Cliente) => void;
}

export const useClientesStore = create<ClientesStore>((set) => ({
    clientes: [],
    setClientes: (clientes) => set({ clientes }),
    addCliente: (cliente) => set((state) => ({ clientes: [...state.clientes, cliente] })),
    updateCliente: (id, updatedCliente) =>
        set((state) => ({
            clientes: state.clientes.map((c) =>
                Number(c.id_cliente) === Number(id) ? { ...c, ...updatedCliente } : c
            ),
        })),
}));