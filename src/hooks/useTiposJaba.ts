// hooks/useTiposJaba.ts
'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { TipoJaba } from '@/types/tipoJaba';

export const useTiposJaba = () => {
    const [tiposJaba, setTiposJaba] = useState<TipoJaba[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<TipoJaba[]>('tipos-jaba');
            setTiposJaba(data);
        } catch (error) {
            console.error('Error fetching tipos de jaba:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (tipo: Partial<TipoJaba>) => {
        const newTipo = await fetchWithAuth<TipoJaba>('tipos-jaba', {
            method: 'POST',
            body: tipo,
        });
        // ✅ Actualización local: agregar al final
        setTiposJaba(prev => [...prev, newTipo]);
        return newTipo;
    }, []);

    const update = useCallback(async (id: number, tipo: Partial<TipoJaba>) => {
        const updated = await fetchWithAuth<TipoJaba>(`tipos-jaba/${id}`, {
            method: 'PATCH',   // cambiar de PUT a PATCH
            body: tipo,
        });
        // ✅ Actualización local: reemplazar el modificado
        setTiposJaba(prev => prev.map(t => t.id_tipo_jaba === id ? updated : t));
        return updated;
    }, []);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        const updated = await fetchWithAuth<TipoJaba>(`tipos-jaba/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        // ✅ Actualización local: cambiar estado
        setTiposJaba(prev => prev.map(t => t.id_tipo_jaba === id ? updated : t));
        return updated;
    }, []);

    // ❌ remove eliminado

    return { tiposJaba, loading, fetchAll, create, update, toggleEstado };
};