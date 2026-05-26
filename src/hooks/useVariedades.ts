import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Variedad } from '@/types/variedad';

export const useVariedades = () => {
    const [variedades, setVariedades] = useState<Variedad[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Variedad[]>('variedades');
            setVariedades(data);
        } catch (error) {
            console.error('Error fetching variedades:', error);
            throw error; // opcional, para que el componente pueda manejarlo
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchByFruta = useCallback(async (frutaId: number) => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Variedad[]>(`variedades/frutas/${frutaId}/variedades`);
            return data;
        } catch (error) {
            console.error('Error fetching variedades by fruta:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (variedad: Partial<Variedad>) => {
        const newVariedad = await fetchWithAuth<Variedad>('variedades', {
            method: 'POST',
            body: variedad,
        });
        await fetchAll();
        return newVariedad;
    }, [fetchAll]);

    const update = useCallback(async (id: number, variedad: Partial<Variedad>) => {
        const updated = await fetchWithAuth<Variedad>(`variedades/${id}`, {
            method: 'PUT',
            body: variedad,
        });
        await fetchAll();
        return updated;
    }, [fetchAll]);

    const remove = useCallback(async (id: number) => {
        await fetchWithAuth(`variedades/${id}`, { method: 'DELETE' });
        await fetchAll();
    }, [fetchAll]);

    return { variedades, loading, fetchAll, fetchByFruta, create, update, remove };
};