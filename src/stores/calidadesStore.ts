import { create } from 'zustand';
import type { Calidad } from '@/types/calidad';

interface CalidadesStore {
    calidades: Calidad[];
    setCalidades: (calidades: Calidad[]) => void;
    addCalidad: (calidad: Calidad) => void;
    updateCalidad: (id: number, updatedCalidad: Calidad) => void;
}

export const useCalidadesStore = create<CalidadesStore>((set) => ({
    calidades: [],
    setCalidades: (calidades) => set({ calidades }),
    addCalidad: (calidad) => set((state) => ({ calidades: [...state.calidades, calidad] })),
    updateCalidad: (id, updatedCalidad) =>
        set((state) => ({
            calidades: state.calidades.map((c) =>
                // Convierte ambos lados a número (o a string) para comparar correctamente
                Number(c.id_calidad) === Number(id)
                    ? { ...c, ...updatedCalidad }   // fusión en lugar de reemplazo directo
                    : c
            ),
        })),
}));