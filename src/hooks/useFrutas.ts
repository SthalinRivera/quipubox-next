// hooks/useFrutas.ts
import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Fruta } from '@/types/fruta';

export const useFrutas = () => {
    const [frutas, setFrutas] = useState<Fruta[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Fruta[]>('frutas');
            setFrutas(data);
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (payload: Partial<Fruta>) => {
        const newFruta = await fetchWithAuth<Fruta>('frutas', {
            method: 'POST',
            body: { id_empresa: 1, ...payload },
        });
        setFrutas(prev => [...prev, newFruta]); // ✅ solo agrega la nueva
        return newFruta;
    }, []);

    const update = useCallback(async (id: number, payload: Partial<Fruta>) => {
        const updated = await fetchWithAuth<Fruta>(`frutas/${id}`, {
            method: 'PATCH',
            body: payload,
        });
        setFrutas(prev => prev.map(f => f.id_fruta === id ? updated : f)); // ✅ reemplaza la modificada
        return updated;
    }, []);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        const updated = await fetchWithAuth<Fruta>(`frutas/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        setFrutas(prev => prev.map(f => f.id_fruta === id ? updated : f));
        return updated;
    }, []);

    return { frutas, loading, fetchAll, create, update, toggleEstado };
};