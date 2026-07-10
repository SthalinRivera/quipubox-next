'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useJabasPorPagarStore } from '@/stores/jabasPorPagarStore';
import type { JabaPorPagar } from '@/types/jaba';

export const useJabasPorPagar = () => {
    const { jabas, setJabas, addJaba, updateJaba, removeJaba } = useJabasPorPagarStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<any>('jabas/por-pagar');
            const list = Array.isArray(data) ? data : data?.data || data?.items || [];
            setJabas(list);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [setJabas]);

    const registrarDevolucion = useCallback(async (payload: {
        id_jaba_pagar: number;
        cantidad: number;
        tipo_devolucion: string;
        fecha_devolucion: string;
        observaciones?: string;
    }) => {
        try {
            const result = await fetchWithAuth<any>('jabas/devoluciones-emisor', {
                method: 'POST',
                body: payload,
            });
            await fetchAll();
            return result;
        } catch (err) {
            throw err;
        }
    }, [fetchAll]);

    const cambiarEstado = useCallback(async (id: number, nuevoEstado: string) => {
        try {
            const updated = await fetchWithAuth<JabaPorPagar>(`jabas/por-pagar/${id}/estado`, {
                method: 'PATCH',
                body: { estado: nuevoEstado },
            });
            updateJaba(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updateJaba]);

    return { jabas, loading, error, fetchAll, registrarDevolucion, cambiarEstado };
};
