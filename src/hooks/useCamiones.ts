// hooks/useCamiones.ts
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

    const create = useCallback(async (camion: Partial<Camion>) => {
        const newCamion = await fetchWithAuth<Camion>('camiones', {
            method: 'POST',
            body: camion,
        });
        setCamiones(prev => [...prev, newCamion]);
        return newCamion;
    }, []);

    const update = useCallback(async (id: number, camion: Partial<Camion>) => {
        const updated = await fetchWithAuth<Camion>(`camiones/${id}`, {
            method: 'PATCH', // Cambiado de PUT a PATCH
            body: camion,
        });
        setCamiones(prev => prev.map(c => c.id_camion === id ? updated : c));
        return updated;
    }, []);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        const updated = await fetchWithAuth<Camion>(`camiones/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        setCamiones(prev => prev.map(c => c.id_camion === id ? updated : c));
        return updated;
    }, []);

    // ❌ remove eliminado

    return { camiones, loading, fetchAll, create, update, toggleEstado };
};