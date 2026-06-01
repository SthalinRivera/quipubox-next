'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Empresa } from '@/types/empresa';

export const useEmpresas = () => {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth<any>('empresas');
            console.log('Respuesta empresas:', response); // 👈 Depura

            let empresasArray: Empresa[] = [];
            if (Array.isArray(response)) {
                empresasArray = response;
            } else if (response?.empresas && Array.isArray(response.empresas)) {
                empresasArray = response.empresas;
            } else if (response?.data && Array.isArray(response.data)) {
                empresasArray = response.data;
            }
            setEmpresas(empresasArray);
        } catch (error) {
            console.error('Error fetching empresas:', error);
            setEmpresas([]);
        } finally {
            setLoading(false);
        }
    }, []);
    const create = async (empresa: Partial<Empresa>) => {
        const newEmpresa = await fetchWithAuth<Empresa>('empresas', {
            method: 'POST',
            body: empresa,
        });
        await fetchAll();
        return newEmpresa;
    };

    const update = async (id: number, empresa: Partial<Empresa>) => {
        const updated = await fetchWithAuth<Empresa>(`empresas/${id}`, {
            method: 'PATCH',     // backend usa PATCH, no PUT
            body: empresa,
        });
        await fetchAll();
        return updated;
    };

    const remove = async (id: number) => {
        await fetchWithAuth(`empresas/${id}`, { method: 'DELETE' });
        await fetchAll();
    };

    return { empresas, loading, fetchAll, create, update, remove };
};