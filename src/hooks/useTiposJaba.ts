'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useTiposJabaStore } from '@/stores/tiposJabaStore';
import type { TipoJaba } from '@/types/tipoJaba';

export const useTiposJaba = () => {
    const { tiposJaba, setTiposJaba, addTipoJaba, updateTipoJaba } = useTiposJabaStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<TipoJaba[]>('tipos-jaba');
            setTiposJaba(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [setTiposJaba]);

    const create = useCallback(async (tipoData: Partial<TipoJaba>) => {
        try {
            const newTipo = await fetchWithAuth<TipoJaba>('tipos-jaba', {
                method: 'POST',
                body: tipoData,
            });
            addTipoJaba(newTipo);
            return newTipo;
        } catch (err) {
            throw err;
        }
    }, [addTipoJaba]);

    const update = useCallback(async (id: number, tipoData: Partial<TipoJaba>) => {
        try {
            const updated = await fetchWithAuth<TipoJaba>(`tipos-jaba/${id}`, {
                method: 'PUT',
                body: tipoData,
            });
            // 🔥 Si enviamos descripcion: null, forzamos que el objeto actualizado tenga descripcion: null
            const finalUpdated = tipoData.descripcion === null
                ? { ...updated, descripcion: null }
                : updated;
            updateTipoJaba(id, finalUpdated);
            return finalUpdated;
        } catch (err) {
            throw err;
        }
    }, [updateTipoJaba]);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        try {
            const updated = await fetchWithAuth<TipoJaba>(`tipos-jaba/${id}/estado`, {
                method: 'PATCH',
                body: { estado },
            });
            updateTipoJaba(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updateTipoJaba]);

    return { tiposJaba, loading, error, fetchAll, create, update, toggleEstado };
};