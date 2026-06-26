// hooks/useJabasPorCobrar.ts
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
            console.log('🔍 Respuesta de jabas/por-cobrar:', data); // <-- LOG
            // Si la respuesta viene envuelta en { data: [...] } o { items: [...] }
            const list = Array.isArray(data) ? data : data?.data || data?.items || [];
            setJabas(list);
        } catch (err: any) {
            console.error('❌ Error en fetchAll:', err);
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
            // Después de crear, refrescar la lista (o actualizar localmente)
            await fetchAll();
            return result;
        } catch (err) {
            console.error('❌ Error en registrarRecuperacion:', err);
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
            // Actualizar localmente
            updateJaba(id, updated);
            return updated;
        } catch (err) {
            console.error('❌ Error en cambiarEstado:', err);
            throw err;
        }
    }, [updateJaba]);

    return { jabas, loading, error, fetchAll, registrarRecuperacion, cambiarEstado };
};