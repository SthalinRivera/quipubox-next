// hooks/useVariedades.ts
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
        // ✅ Actualización local: agregar al final
        setVariedades(prev => [...prev, newVariedad]);
        return newVariedad;
    }, []);

    const update = useCallback(async (id: number, variedad: Partial<Variedad>) => {
        const updated = await fetchWithAuth<Variedad>(`variedades/${id}`, {
            method: 'PATCH', // Cambiado de PUT a PATCH
            body: variedad,
        });
        // ✅ Actualización local: reemplazar la modificada
        setVariedades(prev => prev.map(v => v.id_variedad === id ? updated : v));
        return updated;
    }, []);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        const updated = await fetchWithAuth<Variedad>(`variedades/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        // ✅ Actualización local: cambiar estado
        setVariedades(prev => prev.map(v => v.id_variedad === id ? updated : v));
        return updated;
    }, []);

    return { variedades, loading, fetchAll, fetchByFruta, create, update, toggleEstado };
};