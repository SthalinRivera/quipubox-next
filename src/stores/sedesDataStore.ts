// stores/sedesDataStore.ts
import { create } from 'zustand';
import type { Sede } from '@/types/sede';

interface SedesDataStore {
    sedes: Sede[];
    setSedes: (sedes: Sede[]) => void;
    addSede: (sede: Sede) => void;
    updateSede: (id: number, updatedSede: Sede) => void;
}

export const useSedesDataStore = create<SedesDataStore>((set) => ({
    sedes: [],
    setSedes: (sedes) => set({ sedes }),
    addSede: (sede) => set((state) => ({ sedes: [...state.sedes, sede] })),
    updateSede: (id, updatedSede) =>
        set((state) => ({
            sedes: state.sedes.map((s) =>
                Number(s.id_sede) === Number(id)
                    ? { ...s, ...updatedSede }  // fusión para preservar relaciones
                    : s
            ),
        })),
}));