import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SedesUIState {
    search: string;
    tipoSede: string;
    setSearch: (search: string) => void;
    setTipoSede: (tipo: string) => void;
    resetFilters: () => void;
}

export const useSedesUIStore = create<SedesUIState>()(
    persist(
        (set) => ({
            search: '',
            tipoSede: '',
            setSearch: (search) => set({ search }),
            setTipoSede: (tipo) => set({ tipoSede: tipo }),
            resetFilters: () => set({ search: '', tipoSede: '' }),
        }),
        { name: 'sedes-filters' }
    )
);