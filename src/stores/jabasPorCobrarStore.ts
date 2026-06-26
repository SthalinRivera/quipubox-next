// stores/jabasPorCobrarStore.ts
import { create } from 'zustand';
import type { JabaPorCobrar } from '@/types/jaba';

interface JabasPorCobrarStore {
    jabas: JabaPorCobrar[];
    setJabas: (jabas: JabaPorCobrar[]) => void;
    addJaba: (jaba: JabaPorCobrar) => void;
    updateJaba: (id: number, data: Partial<JabaPorCobrar>) => void;
    removeJaba: (id: number) => void;
}

export const useJabasPorCobrarStore = create<JabasPorCobrarStore>((set) => ({
    jabas: [],
    setJabas: (jabas) => set({ jabas }),
    addJaba: (jaba) => set((state) => ({ jabas: [...state.jabas, jaba] })),
    updateJaba: (id, data) =>
        set((state) => ({
            jabas: state.jabas.map((j) =>
                j.id_jaba_cobrar === id ? { ...j, ...data } : j
            ),
        })),
    removeJaba: (id) =>
        set((state) => ({
            jabas: state.jabas.filter((j) => j.id_jaba_cobrar !== id),
        })),
}));