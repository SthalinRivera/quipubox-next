'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Calidad } from '@/types/calidad';

export const useCalidades = () => {
    const [calidades, setCalidades] = useState<Calidad[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Calidad[]>('calidades');
            setCalidades(data);
        } catch (error) {
            console.error('Error fetching calidades:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const create = async (calidad: Partial<Calidad>) => {
        const newCalidad = await fetchWithAuth<Calidad>('calidades', {
            method: 'POST',
            body: calidad,
        });
        await fetchAll();
        return newCalidad;
    };

    const update = async (id: number, calidad: Partial<Calidad>) => {
        const updated = await fetchWithAuth<Calidad>(`calidades/${id}`, {
            method: 'PUT',
            body: calidad,
        });
        await fetchAll();
        return updated;
    };

    const remove = async (id: number) => {
        await fetchWithAuth(`calidades/${id}`, { method: 'DELETE' });
        await fetchAll();
    };

    return { calidades, loading, fetchAll, create, update, remove };
};