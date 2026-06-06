import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PuestosUIState {
    search: string;
    mercadoId: string;
    tipoLugar: string;
    setSearch: (search: string) => void;
    setMercadoId: (id: string) => void;
    setTipoLugar: (tipo: string) => void;
    resetFilters: () => void;
}

export const usePuestosUIStore = create<PuestosUIState>()(
    persist(
        (set) => ({
            search: '',
            mercadoId: '',
            tipoLugar: '',
            setSearch: (search) => set({ search }),
            setMercadoId: (id) => set({ mercadoId: id }),
            setTipoLugar: (tipo) => set({ tipoLugar: tipo }),
            resetFilters: () => set({ search: '', mercadoId: '', tipoLugar: '' }),
        }),
        { name: 'puestos-filters' }
    )
);