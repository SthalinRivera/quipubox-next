'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useVariedadesStore } from '@/stores/variedadesStore';
import type { Variedad } from '@/types/variedad';

export const useVariedades = () => {
    const { variedades, setVariedades, addVariedad, updateVariedad } = useVariedadesStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Variedad[]>('variedades');
            setVariedades(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [setVariedades]);

    const fetchByFruta = useCallback(async (frutaId: number) => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Variedad[]>(`variedades/frutas/${frutaId}/variedades`);
            return data;
        } catch (err) {
            setError(err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (variedadData: Partial<Variedad>) => {
        try {
            const newVariedad = await fetchWithAuth<Variedad>('variedades', {
                method: 'POST',
                body: variedadData,
            });
            addVariedad(newVariedad);
            return newVariedad;
        } catch (err) {
            throw err;
        }
    }, [addVariedad]);


    const update = useCallback(async (id: number, variedadData: Partial<Variedad>) => {
        try {
            const updated = await fetchWithAuth<Variedad>(`variedades/${id}`, {
                method: 'PUT',
                body: variedadData,
            });
            updateVariedad(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updateVariedad]);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        try {
            const updated = await fetchWithAuth<Variedad>(`variedades/${id}/estado`, {
                method: 'PATCH',
                body: { estado },
            });
            updateVariedad(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updateVariedad]);

    return {
        variedades,
        loading,
        error,
        fetchAll,
        fetchByFruta,
        create,
        update,
        toggleEstado,
    };
};