import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { Entrega, CreateEntregaDto } from '@/types/entrega';

export const useEntregas = () => {
    const [entregas, setEntregas] = useState<Entrega[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchEntregas = useCallback(async (params?: { id_guia?: number; id_item_reparto?: number; fecha_entrega?: string }) => {
        setLoading(true);
        try {
            let url = 'entregas';
            const query = new URLSearchParams();
            if (params?.id_guia) query.append('id_guia', params.id_guia.toString());
            if (params?.id_item_reparto) query.append('id_item_reparto', params.id_item_reparto.toString());
            if (params?.fecha_entrega) query.append('fecha_entrega', params.fecha_entrega);
            if (query.toString()) url += `?${query}`;
            const data = await fetchWithAuth<Entrega[]>(url);
            setEntregas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setEntregas([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createEntrega = async (dto: CreateEntregaDto) => {
        const newEntrega = await fetchWithAuth<Entrega>('entregas', {
            method: 'POST',
            body: dto,
        });
        await fetchEntregas();
        return newEntrega;
    };

    const updateEntrega = async (id: number, dto: Partial<CreateEntregaDto>) => {
        const updated = await fetchWithAuth<Entrega>(`entregas/${id}`, {
            method: 'PUT',
            body: dto,
        });
        await fetchEntregas();
        return updated;
    };

    const changeState = async (id: number, estado: string) => {
        await fetchWithAuth(`entregas/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        await fetchEntregas();
    };

    const firmarEntrega = async (id: number, nombre_recibe?: string) => {
        await fetchWithAuth(`entregas/${id}/firmar`, {
            method: 'PATCH',
            body: nombre_recibe ? { nombre_recibe } : {},
        });
        await fetchEntregas();
    };

    return {
        entregas,
        loading,
        fetchEntregas,
        createEntrega,
        updateEntrega,
        changeState,
        firmarEntrega,
    };
};