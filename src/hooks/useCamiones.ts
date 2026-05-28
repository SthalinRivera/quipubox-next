'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Camion } from '@/types/camion';

export const useCamiones = () => {
    const [camiones, setCamiones] = useState<Camion[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Camion[]>('camiones');
            setCamiones(data);
        } catch (error) {
            console.error('Error fetching camiones:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const create = async (camion: Partial<Camion>) => {
        const newCamion = await fetchWithAuth<Camion>('camiones', {
            method: 'POST',
            body: camion,
        });
        await fetchAll();
        return newCamion;
    };

    const update = async (id: number, camion: Partial<Camion>) => {
        const updated = await fetchWithAuth<Camion>(`camiones/${id}`, {
            method: 'PUT',
            body: camion,
        });
        await fetchAll();
        return updated;
    };

    const remove = async (id: number) => {
        await fetchWithAuth(`camiones/${id}`, { method: 'DELETE' });
        await fetchAll();
    };

    return { camiones, loading, fetchAll, create, update, remove };
};