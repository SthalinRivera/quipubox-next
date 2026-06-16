'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useEmpresasStore } from '@/stores/empresasStore';
import type { Empresa } from '@/types/empresa';

export const useEmpresas = () => {
    const { empresas, setEmpresas, addEmpresa, updateEmpresa } = useEmpresasStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth<any>('empresas');
            let empresasArray: Empresa[] = [];
            if (Array.isArray(response)) {
                empresasArray = response;
            } else if (response?.empresas && Array.isArray(response.empresas)) {
                empresasArray = response.empresas;
            } else if (response?.data && Array.isArray(response.data)) {
                empresasArray = response.data;
            }
            setEmpresas(empresasArray);
        } catch (err) {
            setError(err);
            setEmpresas([]);
        } finally {
            setLoading(false);
        }
    }, [setEmpresas]);

    const create = useCallback(async (empresaData: Partial<Empresa>) => {
        try {
            const newEmpresa = await fetchWithAuth<Empresa>('empresas', {
                method: 'POST',
                body: empresaData,
            });
            addEmpresa(newEmpresa);
            return newEmpresa;
        } catch (err) {
            throw err;
        }
    }, [addEmpresa]);

    const update = useCallback(async (id: number, empresaData: Partial<Empresa>) => {
        try {
            const updatedEmpresa = await fetchWithAuth<Empresa>(`empresas/${id}`, {
                method: 'PUT',  // como pediste
                body: empresaData,
            });
            updateEmpresa(id, updatedEmpresa);
            return updatedEmpresa;
        } catch (err) {
            throw err;
        }
    }, [updateEmpresa]);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        try {
            const updatedEmpresa = await fetchWithAuth<Empresa>(`empresas/${id}/estado`, {
                method: 'PATCH',
                body: { estado },
            });
            updateEmpresa(id, updatedEmpresa);
            return updatedEmpresa;
        } catch (err) {
            throw err;
        }
    }, [updateEmpresa]);

    return { empresas, loading, error, fetchAll, create, update, toggleEstado };
};