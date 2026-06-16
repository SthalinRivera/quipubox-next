'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useCalidadesStore } from '@/stores/calidadesStore';
import type { Calidad } from '@/types/calidad';

export const useCalidades = () => {
    const { calidades, setCalidades, addCalidad, updateCalidad } = useCalidadesStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Calidad[]>('calidades');
            setCalidades(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [setCalidades]);

    const create = useCallback(async (calidadData: Partial<Calidad>) => {
        const newCalidad = await fetchWithAuth<Calidad>('calidades', {
            method: 'POST',
            body: calidadData,
        });
        addCalidad(newCalidad);
        return newCalidad;
    }, [addCalidad]);

    const update = useCallback(async (id: number, calidadData: Partial<Calidad>) => {
        const updated = await fetchWithAuth<Calidad>(`calidades/${id}`, {
            method: 'PUT',
            body: calidadData,
        });
        updateCalidad(id, updated);  // <- esto actualiza el store
        return updated;
    }, [updateCalidad]);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        const updated = await fetchWithAuth<Calidad>(`calidades/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        updateCalidad(id, updated);
        return updated;
    }, [updateCalidad]);

    return { calidades, loading, error, fetchAll, create, update, toggleEstado };
};