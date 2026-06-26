// stores/jabasPorPagarStore.ts
import { create } from 'zustand';
import type { JabaPorPagar } from '@/types/jaba';

interface JabasPorPagarStore {
    jabas: JabaPorPagar[];
    setJabas: (jabas: JabaPorPagar[]) => void;
    addJaba: (jaba: JabaPorPagar) => void;
    updateJaba: (id: number, data: Partial<JabaPorPagar>) => void;
    removeJaba: (id: number) => void;
}

export const useJabasPorPagarStore = create<JabasPorPagarStore>((set) => ({
    jabas: [],
    setJabas: (jabas) => set({ jabas }),
    addJaba: (jaba) => set((state) => ({ jabas: [...state.jabas, jaba] })),
    updateJaba: (id, data) =>
        set((state) => ({
            jabas: state.jabas.map((j) => (j.id_jaba_pagar === id ? { ...j, ...data } : j)),
        })),
    removeJaba: (id) =>
        set((state) => ({
            jabas: state.jabas.filter((j) => j.id_jaba_pagar !== id),
        })),
}));