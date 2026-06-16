import { create } from 'zustand';
import type { Fruta } from '@/types/fruta';

interface FrutasStore {
    frutas: Fruta[];
    setFrutas: (frutas: Fruta[]) => void;
    addFruta: (fruta: Fruta) => void;
    updateFruta: (id: number, updatedFruta: Fruta) => void;
}

export const useFrutasStore = create<FrutasStore>((set) => ({
    frutas: [],
    setFrutas: (frutas) => set({ frutas }),
    addFruta: (fruta) => set((state) => ({ frutas: [...state.frutas, fruta] })),
    updateFruta: (id, updatedFruta) =>
        set((state) => ({
            frutas: state.frutas.map((fruta) => (fruta.id_fruta === id ? updatedFruta : fruta)),
        })),
}));