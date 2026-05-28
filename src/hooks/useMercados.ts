'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Mercado } from '@/types/mercado';

export const useMercados = () => {
    const [mercados, setMercados] = useState<Mercado[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Mercado[]>('mercados');
            setMercados(data);
        } catch (error) {
            console.error('Error fetching mercados:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const create = async (mercado: Partial<Mercado>) => {
        const newMercado = await fetchWithAuth<Mercado>('mercados', {
            method: 'POST',
            body: mercado,
        });
        await fetchAll();
        return newMercado;
    };

    const update = async (id: number, mercado: Partial<Mercado>) => {
        const updated = await fetchWithAuth<Mercado>(`mercados/${id}`, {
            method: 'PUT',
            body: mercado,
        });
        await fetchAll();
        return updated;
    };

    const remove = async (id: number) => {
        await fetchWithAuth(`mercados/${id}`, { method: 'DELETE' });
        await fetchAll();
    };

    return { mercados, loading, fetchAll, create, update, remove };
};