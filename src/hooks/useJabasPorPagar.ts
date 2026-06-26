// hooks/useJabasPorPagar.ts
'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useJabasPorPagarStore } from '@/stores/jabasPorPagarStore';
import type { JabaPorPagar } from '@/types/jaba';

export const useJabasPorPagar = () => {
    const { jabas, setJabas, addJaba, updateJaba, removeJaba } = useJabasPorPagarStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    // Obtener todos los registros
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<JabaPorPagar[]>('jabas/por-pagar');
            setJabas(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [setJabas]);

    // Registrar una devolución (crea un movimiento en devoluciones_jabas_emisor)
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
            // Actualizar el estado local: podríamos recibir el registro actualizado o refetch
            // Lo más sencillo es refetch, pero para mejor UX actualizamos el saldo local
            // Asumimos que el endpoint devuelve la jaba actualizada:
            if (result?.jabaActualizada) {
                updateJaba(payload.id_jaba_pagar, result.jabaActualizada);
            } else {
                // Si no, hacemos fetchAll
                await fetchAll();
            }
            return result;
        } catch (err) {
            throw err;
        }
    }, [updateJaba, fetchAll]);

    // Cambiar estado (anular, completar, etc.)
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

    // Opcional: eliminar (si se permite)
    const remove = useCallback(async (id: number) => {
        try {
            await fetchWithAuth(`jabas/por-pagar/${id}`, { method: 'DELETE' });
            removeJaba(id);
        } catch (err) {
            throw err;
        }
    }, [removeJaba]);

    return { jabas, loading, error, fetchAll, registrarDevolucion, cambiarEstado, remove };
};