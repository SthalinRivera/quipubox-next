'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { TipoJaba } from '@/types/tipoJaba';

export const useTiposJaba = () => {
    const [tiposJaba, setTiposJaba] = useState<TipoJaba[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<TipoJaba[]>('tipos-jaba');
            setTiposJaba(data);
        } catch (error) {
            console.error('Error fetching tipos de jaba:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const create = async (tipo: Partial<TipoJaba>) => {
        const newTipo = await fetchWithAuth<TipoJaba>('tipos-jaba', {
            method: 'POST',
            body: tipo,
        });
        await fetchAll();
        return newTipo;
    };

    const update = async (id: number, tipo: Partial<TipoJaba>) => {
        const updated = await fetchWithAuth<TipoJaba>(`tipos-jaba/${id}`, {
            method: 'PUT',
            body: tipo,
        });
        await fetchAll();
        return updated;
    };

    const remove = async (id: number) => {
        await fetchWithAuth(`tipos-jaba/${id}`, { method: 'DELETE' });
        await fetchAll();
    };

    return { tiposJaba, loading, fetchAll, create, update, remove };
};