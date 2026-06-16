import { create } from 'zustand';
import type { TipoJaba } from '@/types/tipoJaba';

interface TiposJabaStore {
    tiposJaba: TipoJaba[];
    setTiposJaba: (tiposJaba: TipoJaba[]) => void;
    addTipoJaba: (tipoJaba: TipoJaba) => void;
    updateTipoJaba: (id: number, updatedTipoJaba: TipoJaba) => void;
}

export const useTiposJabaStore = create<TiposJabaStore>((set) => ({
    tiposJaba: [],
    setTiposJaba: (tiposJaba) => set({ tiposJaba }),
    addTipoJaba: (tipoJaba) => set((state) => ({ tiposJaba: [...state.tiposJaba, tipoJaba] })),
    updateTipoJaba: (id, updatedTipoJaba) =>
        set((state) => ({
            tiposJaba: state.tiposJaba.map((t) =>
                Number(t.id_tipo_jaba) === Number(id)
                    ? { ...t, ...updatedTipoJaba } // fusión para preservar relaciones
                    : t
            ),
        })),
}));