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
            return data;
        } catch (error) {
            console.error('Error fetching frutas:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (fruta: Partial<Fruta>) => {
        // Asegurar que id_empresa esté presente (por ahora fijo a 1, o lo obtienes de la sesión)
        const payload = {
            id_empresa: 1,  // Reemplazar con la empresa del usuario logueado
            nombre: fruta.nombre,
            descripcion: fruta.descripcion,
            estado: fruta.estado ?? true,
        };
        const newFruta = await fetchWithAuth<Fruta>('frutas', {
            method: 'POST',
            body: payload,
        });
        await fetchAll();
        return newFruta;
    }, [fetchAll]);

    const update = useCallback(async (id: number, fruta: Partial<Fruta>) => {
        const updated = await fetchWithAuth<Fruta>(`frutas/${id}`, {
            method: 'PUT',
            body: fruta,
        });
        await fetchAll();
        return updated;
    }, [fetchAll]);

    const remove = useCallback(async (id: number) => {
        await fetchWithAuth(`frutas/${id}`, { method: 'DELETE' });
        await fetchAll();
    }, [fetchAll]);

    return { frutas, loading, fetchAll, create, update, remove };
};