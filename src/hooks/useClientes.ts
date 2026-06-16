// hooks/useClientes.ts
'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useClientesStore } from '@/stores/clientesStore';
import type { Cliente, ClientePuesto } from '@/types/cliente';

export const useClientes = () => {
    const { clientes, setClientes, addCliente, updateCliente } = useClientesStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    // ---------- CRUD ----------
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Cliente[]>('clientes');
            setClientes(data);
        } catch (err) { setError(err); }
        finally { setLoading(false); }
    }, [setClientes]);

    const create = useCallback(async (clienteData: Partial<Cliente>) => {
        const newCliente = await fetchWithAuth<Cliente>('clientes', { method: 'POST', body: clienteData });
        addCliente(newCliente);
        return newCliente;
    }, [addCliente]);

    const update = useCallback(async (id: number, clienteData: Partial<Cliente>) => {
        const updated = await fetchWithAuth<Cliente>(`clientes/${id}`, { method: 'PUT', body: clienteData });
        updateCliente(id, updated);
        return updated;
    }, [updateCliente]);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        const updated = await fetchWithAuth<Cliente>(`clientes/${id}/estado`, { method: 'PATCH', body: { estado } });
        updateCliente(id, updated);
        return updated;
    }, [updateCliente]);

    // ---------- Sedes ----------
    const fetchSedesByCliente = useCallback(async (clienteId: number) => {
        const data = await fetchWithAuth<any[]>(`clientes/${clienteId}/sedes`);
        return data;
    }, []);

    const assignSede = useCallback(async (clienteId: number, sedeId: number, tipoRelacion: string) => {
        return await fetchWithAuth(`clientes/sedes`, {
            method: 'POST',
            body: { id_cliente: clienteId, id_sede: sedeId, tipo_relacion: tipoRelacion },
        });
    }, []);

    const removeSede = useCallback(async (clienteId: number, sedeId: number) => {
        await fetchWithAuth(`clientes/${clienteId}/sedes/${sedeId}`, { method: 'DELETE' });
    }, []);

    // ---------- Puestos ----------
    const fetchPuestosByCliente = useCallback(async (clienteId: number) => {
        const data = await fetchWithAuth<ClientePuesto[]>(`clientes/${clienteId}/puestos`);
        return data;
    }, []);

    const assignPuesto = useCallback(async (clienteId: number, puestoId: number, seccion: string | null) => {
        return await fetchWithAuth(`clientes/${clienteId}/puestos`, {
            method: 'POST',
            body: { id_puesto: puestoId, seccion },
        });
    }, []);

    const removePuesto = useCallback(async (clienteId: number, puestoId: number) => {
        await fetchWithAuth(`clientes/${clienteId}/puestos/${puestoId}`, { method: 'DELETE' });
    }, []);

    // Alias para compatibilidad
    const getPuestos = fetchPuestosByCliente;

    return {
        clientes, loading, error,
        fetchAll, create, update, toggleEstado,
        fetchSedesByCliente, assignSede, removeSede,
        fetchPuestosByCliente, assignPuesto, removePuesto,
        getPuestos,
    };
};