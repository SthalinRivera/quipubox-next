import { create } from 'zustand';
import type { Camion } from '@/types/camion';

interface CamionesStore {
    camiones: Camion[];
    setCamiones: (camiones: Camion[]) => void;
    addCamion: (camion: Camion) => void;
    updateCamion: (id: number, updatedCamion: Camion) => void;
}

export const useCamionesStore = create<CamionesStore>((set) => ({
    camiones: [],
    setCamiones: (camiones) => set({ camiones }),
    addCamion: (camion) => set((state) => ({ camiones: [...state.camiones, camion] })),
    updateCamion: (id, updatedCamion) =>
        set((state) => ({
            camiones: state.camiones.map((c) =>
                Number(c.id_camion) === Number(id)
                    ? { ...c, ...updatedCamion }  // fusión para preservar relaciones
                    : c
            ),
        })),
}));