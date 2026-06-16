import { create } from 'zustand';
import type { LugarOperativo } from '@/types/lugarOperativo';

interface LugaresOperativosStore {
    lugares: LugarOperativo[];
    setLugares: (lugares: LugarOperativo[]) => void;
    addLugar: (lugar: LugarOperativo) => void;
    updateLugar: (id: number, updatedLugar: LugarOperativo) => void;
}

export const useLugaresOperativosStore = create<LugaresOperativosStore>((set) => ({
    lugares: [],
    setLugares: (lugares) => set({ lugares }),
    addLugar: (lugar) => set((state) => ({ lugares: [...state.lugares, lugar] })),
    updateLugar: (id, updatedLugar) =>
        set((state) => ({
            lugares: state.lugares.map((l) =>
                Number(l.id_lugar) === Number(id) ? { ...l, ...updatedLugar } : l
            ),
        })),
}));