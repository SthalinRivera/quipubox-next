import { create } from 'zustand';
import type { Empresa } from '@/types/empresa';

interface EmpresasStore {
    empresas: Empresa[];
    setEmpresas: (empresas: Empresa[]) => void;
    addEmpresa: (empresa: Empresa) => void;
    updateEmpresa: (id: number, updatedEmpresa: Empresa) => void;
}

export const useEmpresasStore = create<EmpresasStore>((set) => ({
    empresas: [],
    setEmpresas: (empresas) => set({ empresas }),
    addEmpresa: (empresa) => set((state) => ({ empresas: [...state.empresas, empresa] })),
    updateEmpresa: (id, updatedEmpresa) =>
        set((state) => ({
            empresas: state.empresas.map((emp) => (emp.id_empresa === id ? updatedEmpresa : emp)),
        })),
}));