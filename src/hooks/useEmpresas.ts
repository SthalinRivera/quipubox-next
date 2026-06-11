// hooks/useEmpresas.ts
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

    const create = useCallback(async (empresa: Partial<Empresa>) => {
        const newEmpresa = await fetchWithAuth<Empresa>('empresas', {
            method: 'POST',
            body: empresa,
        });
        // ✅ Actualización local: agregar la nueva empresa al final
        setEmpresas(prev => [...prev, newEmpresa]);
        return newEmpresa;
    }, []);

    const update = useCallback(async (id: number, empresa: Partial<Empresa>) => {
        const updated = await fetchWithAuth<Empresa>(`empresas/${id}`, {
            method: 'PATCH',
            body: empresa,
        });
        // ✅ Actualización local: reemplazar la empresa modificada
        setEmpresas(prev => prev.map(emp => emp.id_empresa === id ? updated : emp));
        return updated;
    }, []);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        const updated = await fetchWithAuth<Empresa>(`empresas/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        // ✅ Actualización local: cambiar el estado de la empresa
        setEmpresas(prev => prev.map(emp => emp.id_empresa === id ? updated : emp));
        return updated;
    }, []);

    return { empresas, loading, fetchAll, create, update, toggleEstado };
};