// hooks/useLugarOperativo.ts
'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { LugarOperativo } from '@/types/lugarOperativo';

export const useLugarOperativo = () => {
    const [lugares, setLugares] = useState<LugarOperativo[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<LugarOperativo[]>('lugares-operativos');
            setLugares(data);
        } catch (error) {
            console.error('Error fetching lugares operativos:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (payload: Partial<LugarOperativo>) => {
        const newItem = await fetchWithAuth<LugarOperativo>('lugares-operativos', {
            method: 'POST',
            body: payload,
        });
        setLugares(prev => [...prev, newItem]);
        return newItem;
    }, []);

    const update = useCallback(async (id: number, payload: Partial<LugarOperativo>) => {
        const updated = await fetchWithAuth<LugarOperativo>(`lugares-operativos/${id}`, {
            method: 'PATCH', // Cambiado de PUT a PATCH
            body: payload,
        });
        setLugares(prev => prev.map(item => item.id_lugar === id ? updated : item));
        return updated;
    }, []);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        const updated = await fetchWithAuth<LugarOperativo>(`lugares-operativos/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        setLugares(prev => prev.map(item => item.id_lugar === id ? updated : item));
        return updated;
    }, []);

    // ❌ remove eliminado

    return { lugares, loading, fetchAll, create, update, toggleEstado };
};