'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { LugarOperativo } from '@/types/lugarOperativo';

export const useLugarOperativo = () => {
    const [lugarOpertivo, setMercados] = useState<LugarOperativo[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<LugarOperativo[]>('lugares-operativos');
            setMercados(data);
        } catch (error) {
            console.error('Error fetching mercados:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const create = async (mercado: Partial<LugarOperativo>) => {
        const newMercado = await fetchWithAuth<LugarOperativo>('lugares-operativos', {
            method: 'POST',
            body: mercado,
        });
        await fetchAll();
        return newMercado;
    };

    const update = async (id: number, mercado: Partial<LugarOperativo>) => {
        const updated = await fetchWithAuth<LugarOperativo>(`lugares-operativos/${id}`, {
            method: 'PUT',
            body: mercado,
        });
        await fetchAll();
        return updated;
    };

    const remove = async (id: number) => {
        await fetchWithAuth(`lugares-operativos/${id}`, { method: 'DELETE' });
        await fetchAll();
    };

    return { lugarOpertivo, loading, fetchAll, create, update, remove };
};