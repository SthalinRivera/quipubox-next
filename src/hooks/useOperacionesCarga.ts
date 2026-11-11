// hooks/useOperacionesCarga.ts
import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { OperacionCarga, CreateOperacionCargaDTO, UpdateOperacionCargaDTO } from '@/types/operacionCarga';

export const useOperacionesCarga = () => {
    const [operaciones, setOperaciones] = useState<OperacionCarga[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState('');

    const fetchAll = useCallback(async (params?: { estado?: string; fecha?: string; page?: number }) => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (params?.estado) query.append('estado', params.estado);
            if (params?.fecha) query.append('fecha', params.fecha);
            query.set('page', String(params?.page || 1));
            query.set('limit', '20');
            const url = `operaciones-carga/resumen-repartos${query.toString() ? `?${query}` : ''}`;
            const response = await fetchWithAuth<{ data: OperacionCarga[]; total: number }>(url);
            setOperaciones(response.data); setTotal(response.total); setError('');
        } catch (error) {
            console.error('Error fetching operaciones:', error);
            setOperaciones([]); setTotal(0); setError(error instanceof Error ? error.message : 'No se pudieron cargar las operaciones.');
        } finally {
            setLoading(false);
        }
    }, []);

    const create = async (payload: CreateOperacionCargaDTO) => {
        const newOp = await fetchWithAuth<OperacionCarga>('operaciones-carga', {
            method: 'POST',
            body: payload,
        });
        await fetchAll();
        return newOp;
    };

    const update = async (id: number, payload: UpdateOperacionCargaDTO) => {
        const updated = await fetchWithAuth<OperacionCarga>(`operaciones-carga/${id}`, {
            method: 'PUT', // o PATCH segÃºn tu backend
            body: payload,
        });
        await fetchAll();
        return updated;
    };

    const changeState = async (id: number, estado: string) => {
        await fetchWithAuth(`operaciones-carga/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        await fetchAll();
    };

    return { operaciones, total, error, loading, fetchAll, create, update, changeState };
};