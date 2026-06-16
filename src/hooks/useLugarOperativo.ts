'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useLugaresOperativosStore } from '@/stores/lugaresOperativosStore';
import type { LugarOperativo } from '@/types/lugarOperativo';

export const useLugarOperativo = () => {
    const { lugares, setLugares, addLugar, updateLugar } = useLugaresOperativosStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<LugarOperativo[]>('lugares-operativos');
            setLugares(data);
            return data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLugares]);

    const create = useCallback(async (lugarData: Partial<LugarOperativo>) => {
        try {
            const newLugar = await fetchWithAuth<LugarOperativo>('lugares-operativos', {
                method: 'POST',
                body: lugarData,
            });
            addLugar(newLugar);
            return newLugar;
        } catch (err) {
            throw err;
        }
    }, [addLugar]);

    const update = useCallback(async (id: number, lugarData: Partial<LugarOperativo>) => {
        try {
            const updated = await fetchWithAuth<LugarOperativo>(`lugares-operativos/${id}`, {
                method: 'PUT',        // ✅ PUT
                body: lugarData,
            });
            updateLugar(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updateLugar]);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        try {
            const updated = await fetchWithAuth<LugarOperativo>(`lugares-operativos/${id}/estado`, {
                method: 'PATCH',
                body: { estado },
            });
            updateLugar(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updateLugar]);

    return { lugares: lugares, loading, error, fetchAll, create, update, toggleEstado };
};