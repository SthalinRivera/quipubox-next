// stores/clientesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ClientesUIState {
    // Filtros y paginación
    page: number;
    search: string;
    estado: boolean | 'todos';
    // Acciones
    setPage: (page: number) => void;
    setSearch: (search: string) => void;
    setEstado: (estado: boolean | 'todos') => void;
    resetFilters: () => void;
}

export const useClientesUIStore = create<ClientesUIState>()(
    persist(
        (set) => ({
            page: 1,
            search: '',
            estado: 'todos',
            setPage: (page) => set({ page }),
            setSearch: (search) => set({ search, page: 1 }), // resetear página al buscar
            setEstado: (estado) => set({ estado, page: 1 }), // resetear página al filtrar
            resetFilters: () => set({ search: '', estado: 'todos', page: 1 }),
        }),
        {
            name: 'clientes-filters', // clave en localStorage
            partialize: (state) => ({ search: state.search, estado: state.estado }), // persistir solo filtros
        }
    )
);