'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { usePuestosStore } from '@/stores/puestosStore';
import type { Puesto } from '@/types/puesto';

export const usePuestos = () => {
    const { puestos, setPuestos, addPuesto, updatePuesto } = usePuestosStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<any>('puestos');
            const list = Array.isArray(data) ? data : data?.data || data?.items || [];
            setPuestos(list);
            return list;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setPuestos]);

    const fetchByMercado = useCallback(async (mercadoId: number) => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<any>(`puestos/mercado/${mercadoId}`);
            const list = Array.isArray(data) ? data : data?.data || data?.items || [];
            setPuestos(list);
            return list;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setPuestos]);

    const fetchByCliente = useCallback(async (clienteId: number) => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<any>(`clientes/${clienteId}/puestos`);
            const list = Array.isArray(data) ? data : data?.data || data?.items || [];
            setPuestos(list);
            return list;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setPuestos]);

    const create = useCallback(async (puestoData: Partial<Puesto>) => {
        try {
            const newPuesto = await fetchWithAuth<Puesto>('puestos', {
                method: 'POST',
                body: puestoData,
            });
            addPuesto(newPuesto);
            return newPuesto;
        } catch (err) {
            throw err;
        }
    }, [addPuesto]);

    // ✅ CAMBIADO: ahora usa PUT
    const update = useCallback(async (id: number, puestoData: Partial<Puesto>) => {
        try {
            const updated = await fetchWithAuth<Puesto>(`puestos/${id}`, {
                method: 'PUT',
                body: puestoData,
            });
            updatePuesto(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updatePuesto]);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        try {
            const updated = await fetchWithAuth<Puesto>(`puestos/${id}/estado`, {
                method: 'PATCH',
                body: { estado },
            });
            updatePuesto(id, updated);
            return updated;
        } catch (err) {
            throw err;
        }
    }, [updatePuesto]);

    return {
        puestos,
        loading,
        error,
        fetchAll,
        fetchByMercado,
        fetchByCliente,
        create,
        update,
        toggleEstado,
    };
};