import { create } from 'zustand';
import type { Variedad } from '@/types/variedad';

interface VariedadesStore {
    variedades: Variedad[];
    setVariedades: (variedades: Variedad[]) => void;
    addVariedad: (variedad: Variedad) => void;
    updateVariedad: (id: number, updatedVariedad: Variedad) => void;
}

export const useVariedadesStore = create<VariedadesStore>((set) => ({
    variedades: [],
    setVariedades: (variedades) => set({ variedades }),
    addVariedad: (variedad) => set((state) => ({ variedades: [...state.variedades, variedad] })),
    updateVariedad: (id, updatedVariedad) =>
        set((state) => ({
            variedades: state.variedades.map((v) => (v.id_variedad === id ? updatedVariedad : v)),
        })),
}));