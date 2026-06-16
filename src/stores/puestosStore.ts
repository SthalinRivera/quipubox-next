import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Puesto } from '@/types/puesto';
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
interface PuestosStore {
    puestos: Puesto[];
    setPuestos: (puestos: Puesto[]) => void;
    addPuesto: (puesto: Puesto) => void;
    updatePuesto: (id: number, updatedPuesto: Puesto) => void;
}

export const usePuestosStore = create<PuestosStore>((set) => ({
    puestos: [],
    setPuestos: (puestos) => set({ puestos }),
    addPuesto: (puesto) => set((state) => ({ puestos: [...state.puestos, puesto] })),
    updatePuesto: (id, updatedPuesto) =>
        set((state) => ({
            puestos: state.puestos.map((p) =>
                Number(p.id_puesto) === Number(id)
                    ? { ...p, ...updatedPuesto }
                    : p
            ),
        })),
}));