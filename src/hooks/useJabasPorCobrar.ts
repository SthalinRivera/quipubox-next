import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useJabasPorCobrarStore } from '@/stores/jabasPorCobrarStore';
import type { JabaPorCobrar } from '@/types/jaba';

export const useJabasPorCobrar = () => {
    const { jabas, setJabas, addJaba, updateJaba, removeJaba } = useJabasPorCobrarStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth<any>('jabas/por-cobrar');
            const list = Array.isArray(data) ? data : data?.data || data?.items || [];
            setJabas(list);
        } catch (err: any) {
            setError(err);
            setJabas([]);
        } finally {
            setLoading(false);
        }
    }, [setJabas]);

    const registrarRecuperacion = useCallback(async (payload: any) => {
        try {
            const result = await fetchWithAuth<any>('jabas/recuperaciones', {
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
            const updated = await fetchWithAuth<JabaPorCobrar>(
                `jabas/por-cobrar/${id}/estado`,
                {
                    method: 'PATCH',
                    body: { estado: nuevoEstado },
                }
            );
            updateJaba(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updateJaba]);

    return { jabas, loading, error, fetchAll, registrarRecuperacion, cambiarEstado };
};
