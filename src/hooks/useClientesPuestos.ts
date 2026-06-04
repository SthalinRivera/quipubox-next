import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { ClientePuesto } from '@/types/clientePuesto';

export const useClientesPuestos = () => {
    const [asignaciones, setAsignaciones] = useState<ClientePuesto[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<ClientePuesto[]>('clientes/asignaciones-puestos');
            setAsignaciones(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { asignaciones, loading, fetchAll };
};