// src/stores/incidenciasStore.ts
import { create } from 'zustand';
import { Incidencia } from '@/types/incidencia';

interface IncidenciasState {
    incidencias: Incidencia[];
    setIncidencias: (data: Incidencia[]) => void;
    addIncidencia: (incidencia: Incidencia) => void;
    updateIncidencia: (id: number, data: Incidencia) => void;
    removeIncidencia: (id: number) => void;
}

export const useIncidenciasStore = create<IncidenciasState>((set) => ({
    incidencias: [],
    setIncidencias: (data) => set({ incidencias: data }),
    addIncidencia: (incidencia) =>
        set((state) => ({ incidencias: [...state.incidencias, incidencia] })),
    updateIncidencia: (id, data) =>
        set((state) => ({
            incidencias: state.incidencias.map((inc) =>
                inc.id_incidencia === id ? data : inc
            ),
        })),
    removeIncidencia: (id) =>
        set((state) => ({
            incidencias: state.incidencias.filter((inc) => inc.id_incidencia !== id),
        })),
}));