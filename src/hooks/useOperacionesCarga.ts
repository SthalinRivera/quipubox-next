// hooks/useOperacionesCarga.ts
import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { OperacionCarga, CreateOperacionCargaDTO, UpdateOperacionCargaDTO } from '@/types/operacionCarga';

export const useOperacionesCarga = () => {
    const [operaciones, setOperaciones] = useState<OperacionCarga[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async (params?: { estado?: string; fecha?: string }) => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (params?.estado) query.append('estado', params.estado);
            if (params?.fecha) query.append('fecha', params.fecha);
            const url = `operaciones-carga${query.toString() ? `?${query}` : ''}`;
            const response = await fetchWithAuth<OperacionCarga[]>(url);
            setOperaciones(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching operaciones:', error);
            setOperaciones([]);
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
            method: 'PUT', // o PATCH según tu backend
            body: payload,
        });
        await fetchAll();
        return updated;
    };

    const remove = async (id: number) => {
        await fetchWithAuth(`operaciones-carga/${id}`, { method: 'DELETE' });
        await fetchAll();
    };

    const changeState = async (id: number, estado: string) => {
        await fetchWithAuth(`operaciones-carga/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        await fetchAll();
    };

    return { operaciones, loading, fetchAll, create, update, remove, changeState };
};