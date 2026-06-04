// hooks/useClientes.ts
import { useState, useCallback, useRef } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Cliente, ClienteSede, PuestoAsignado } from '@/types/cliente';

interface ErrorState {
    message: string;
    status?: number;
}

export const useClientes = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorState | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleFetchError = (error: any): ErrorState => {
        if (error.response?.status === 404) return { message: 'Recurso no encontrado', status: 404 };
        if (error.response?.status === 401) return { message: 'No autorizado', status: 401 };
        if (error.response?.status === 409) return { message: 'Conflicto de datos', status: 409 };
        return { message: error.message || 'Error de conexión' };
    };

    const fetchAll = useCallback(async (buscar?: string) => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        setError(null);
        try {
            const url = buscar ? `clientes?buscar=${encodeURIComponent(buscar)}` : 'clientes';
            const data = await fetchWithAuth<Cliente[]>(url, { signal: controller.signal });
            setClientes(data);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            const errState = handleFetchError(err);
            setError(errState);
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, []);

    const create = async (cliente: Omit<Cliente, 'id_cliente' | 'created_at' | 'empresas' | 'cliente_sede' | 'clientes_puestos'> & { estado?: boolean }) => {
        setLoading(true);
        setError(null);
        try {
            const newCliente = await fetchWithAuth<Cliente>('clientes', { method: 'POST', body: cliente });
            setClientes(prev => [newCliente, ...prev]);
            return newCliente;
        } catch (err: any) {
            const errState = handleFetchError(err);
            setError(errState);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const update = async (id: number, cliente: Partial<Omit<Cliente, 'id_cliente' | 'created_at' | 'empresas' | 'cliente_sede' | 'clientes_puestos'>>) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await fetchWithAuth<Cliente>(`clientes/${id}`, { method: 'PUT', body: cliente });
            setClientes(prev => prev.map(c => c.id_cliente === id ? updated : c));
            return updated;
        } catch (err: any) {
            const errState = handleFetchError(err);
            setError(errState);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await fetchWithAuth(`clientes/${id}`, { method: 'DELETE' });
            setClientes(prev => prev.filter(c => c.id_cliente !== id));
        } catch (err: any) {
            const errState = handleFetchError(err);
            setError(errState);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getSedes = async (clienteId: number) => {
        try {
            return await fetchWithAuth<ClienteSede[]>(`clientes/${clienteId}/sedes`);
        } catch (err) {
            console.error('Error fetching sedes:', err);
            throw err;
        }
    };

    const associateSede = async (clienteId: number, sedeId: number, tipoRelacion: string) => {
        try {
            return await fetchWithAuth<ClienteSede>('clientes/sedes', {
                method: 'POST',
                body: { id_cliente: clienteId, id_sede: sedeId, tipo_relacion: tipoRelacion },
            });
        } catch (err) {
            console.error('Error associating sede:', err);
            throw err;
        }
    };

    // ✅ Devuelve PuestoAsignado[] (incluye la relación completa)
    const getPuestos = async (clienteId: number) => {
        try {
            return await fetchWithAuth<PuestoAsignado[]>(`clientes/${clienteId}/puestos`);
        } catch (err) {
            console.error('Error fetching puestos:', err);
            throw err;
        }
    };

    const assignPuesto = async (clienteId: number, puestoId: number, seccion?: string | null) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchWithAuth(`clientes/${clienteId}/puestos`, {
                method: 'POST',
                body: { id_puesto: puestoId, seccion: seccion || null },
            });
            return result;
        } catch (err: any) {
            const errState = handleFetchError(err);
            setError(errState);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removePuesto = async (clienteId: number, puestoId: number) => {
        setLoading(true);
        setError(null);
        try {
            return await fetchWithAuth(`clientes/${clienteId}/puestos/${puestoId}`, {
                method: 'DELETE',
            });
        } catch (err: any) {
            const errState = handleFetchError(err);
            setError(errState);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        clientes,
        loading,
        error,
        fetchAll,
        create,
        update,
        remove,
        getSedes,
        associateSede,
        getPuestos,
        assignPuesto,
        removePuesto,
    };
};