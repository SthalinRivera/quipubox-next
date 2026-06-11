// hooks/useCalidades.ts
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

    const create = useCallback(async (calidad: Partial<Calidad>) => {
        const newCalidad = await fetchWithAuth<Calidad>('calidades', {
            method: 'POST',
            body: calidad,
        });
        // ✅ Actualización local: agregar al final
        setCalidades(prev => [...prev, newCalidad]);
        return newCalidad;
    }, []);

    const update = useCallback(async (id: number, calidad: Partial<Calidad>) => {
        const updated = await fetchWithAuth<Calidad>(`calidades/${id}`, {
            method: 'PATCH',   // cambio de PUT a PATCH
            body: calidad,
        });
        // ✅ Actualización local: reemplazar la modificada
        setCalidades(prev => prev.map(c => c.id_calidad === id ? updated : c));
        return updated;
    }, []);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        const updated = await fetchWithAuth<Calidad>(`calidades/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        // ✅ Actualización local: cambiar estado
        setCalidades(prev => prev.map(c => c.id_calidad === id ? updated : c));
        return updated;
    }, []);

    // ❌ remove eliminado

    return { calidades, loading, fetchAll, create, update, toggleEstado };
};