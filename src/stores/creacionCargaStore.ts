// stores/creacionCargaStore.ts
import { create } from 'zustand';

interface CreacionCargaState {
    operacionId: number | null;
    operacionData: any | null; // datos básicos para precargar
    paso1Completado: boolean;
    paso2Completado: boolean;
    paso3Completado: boolean;
    currentStep: 1 | 2 | 3;

    setOperacion: (id: number, data?: any) => void;
    setPasoCompletado: (paso: 1 | 2 | 3, completado: boolean) => void;
    setCurrentStep: (step: 1 | 2 | 3) => void;
    reset: () => void;
}

export const useCreacionCargaStore = create<CreacionCargaState>((set) => ({
    operacionId: null,
    operacionData: null,
    paso1Completado: false,
    paso2Completado: false,
    paso3Completado: false,
    currentStep: 1,

    setOperacion: (id, data) => set({ operacionId: id, operacionData: data, paso1Completado: true }),
    setPasoCompletado: (paso, completado) => set((state) => {
        if (paso === 1) return { paso1Completado: completado };
        if (paso === 2) return { paso2Completado: completado };
        return { paso3Completado: completado };
    }),
    setCurrentStep: (step) => set({ currentStep: step }),
    reset: () => set({
        operacionId: null,
        operacionData: null,
        paso1Completado: false,
        paso2Completado: false,
        paso3Completado: false,
        currentStep: 1,
    }),
}));