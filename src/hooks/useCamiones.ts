'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useCamionesStore } from '@/stores/camionesStore';
import type { Camion } from '@/types/camion';

export const useCamiones = () => {
    const { camiones, setCamiones, addCamion, updateCamion } = useCamionesStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Camion[]>('camiones');
            setCamiones(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [setCamiones]);

    const create = useCallback(async (camionData: Partial<Camion>) => {
        try {
            const newCamion = await fetchWithAuth<Camion>('camiones', {
                method: 'POST',
                body: camionData,
            });
            addCamion(newCamion);
            return newCamion;
        } catch (err) {
            throw err;
        }
    }, [addCamion]);

    const update = useCallback(async (id: number, camionData: Partial<Camion>) => {
        try {
            const updated = await fetchWithAuth<Camion>(`camiones/${id}`, {
                method: 'PUT',        // ✅ cambiado de PATCH a PUT
                body: camionData,
            });
            updateCamion(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updateCamion]);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        try {
            const updated = await fetchWithAuth<Camion>(`camiones/${id}/estado`, {
                method: 'PATCH',
                body: { estado },
            });
            updateCamion(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updateCamion]);

    return { camiones, loading, error, fetchAll, create, update, toggleEstado };
};