'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useFrutasStore } from '@/stores/frutasStore';
import type { Fruta } from '@/types/fruta';

export const useFrutas = () => {
    const { frutas, setFrutas, addFruta, updateFruta } = useFrutasStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Fruta[]>('frutas');
            setFrutas(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [setFrutas]);

    const create = useCallback(async (payload: Partial<Fruta>) => {
        try {
            // Ajusta el id_empresa según tu lógica (aquí viene del payload o de contexto)
            const newFruta = await fetchWithAuth<Fruta>('frutas', {
                method: 'POST',
                body: { id_empresa: payload.id_empresa ?? 1, ...payload },
            });
            addFruta(newFruta);
            return newFruta;
        } catch (err) {
            throw err;
        }
    }, [addFruta]);

    const update = useCallback(async (id: number, payload: Partial<Fruta>) => {
        try {
            const updated = await fetchWithAuth<Fruta>(`frutas/${id}`, {
                method: 'PUT', // o PUT si prefieres
                body: payload,
            });
            updateFruta(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updateFruta]);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        try {
            const updated = await fetchWithAuth<Fruta>(`frutas/${id}/estado`, {
                method: 'PATCH',
                body: { estado },
            });
            updateFruta(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updateFruta]);

    return { frutas, loading, error, fetchAll, create, update, toggleEstado };
};