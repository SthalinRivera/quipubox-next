'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Puesto } from '@/types/puesto';

export const usePuestos = () => {
    const [puestos, setPuestos] = useState<Puesto[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Puesto[]>('puestos');
            setPuestos(data);
            return data; // ✅ retorna los datos
        } catch (error) {
            console.error('Error fetching puestos:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchByMercado = useCallback(async (mercadoId: number) => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Puesto[]>(`puestos/mercados/${mercadoId}/puestos`);
            setPuestos(data);
            return data;
        } catch (error) {
            console.error('Error fetching puestos by mercado:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchByCliente = useCallback(async (clienteId: number) => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Puesto[]>(`clientes/${clienteId}/puestos`);
            setPuestos(data);
            return data; // ✅ retorna los datos
        } catch (error) {
            console.error('Error fetching puestos by cliente:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const create = async (puesto: Partial<Puesto>) => {
        const newPuesto = await fetchWithAuth<Puesto>('puestos', {
            method: 'POST',
            body: puesto,
        });
        await fetchAll();
        return newPuesto;
    };

    const update = async (id: number, puesto: Partial<Puesto>) => {
        const updated = await fetchWithAuth<Puesto>(`puestos/${id}`, {
            method: 'PUT',
            body: puesto,
        });
        await fetchAll();
        return updated;
    };

    const remove = async (id: number) => {
        await fetchWithAuth(`puestos/${id}`, { method: 'DELETE' });
        await fetchAll();
    };

    return {
        puestos,
        loading,
        fetchAll,
        fetchByMercado,
        fetchByCliente,
        create,
        update,
        remove,
    };
};