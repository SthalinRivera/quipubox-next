import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import {
    Entrega,
    EntregaPendienteTransito,
    CreateEntregaDto,
} from '@/types/entrega';

export const useEntregas = () => {
    const [entregas, setEntregas] = useState<Entrega[]>([]);
    const [entregasResumen, setEntregasResumen] = useState<Entrega[]>([]);
    const [pendientesTransito, setPendientesTransito] = useState<EntregaPendienteTransito[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingResumen, setLoadingResumen] = useState(true);
    const [loadingPendientes, setLoadingPendientes] = useState(false);
    const [errorPendientes, setErrorPendientes] = useState('');
    const [errorResumen, setErrorResumen] = useState('');

    const fetchEntregas = useCallback(async (params?: {
        id_operacion?: number;
        id_calidad?: number;
        id_guia?: number;
        id_item_reparto?: number;
        fecha_entrega?: string;
        estado_entrega?: string;
    }) => {
        setLoading(true);
        try {
            let url = 'entregas';
            const query = new URLSearchParams();
            if (params?.id_operacion) query.append('id_operacion', params.id_operacion.toString());
            if (params?.id_calidad) query.append('id_calidad', params.id_calidad.toString());
            if (params?.id_guia) query.append('id_guia', params.id_guia.toString());
            if (params?.id_item_reparto) query.append('id_item_reparto', params.id_item_reparto.toString());
            if (params?.fecha_entrega) query.append('fecha_entrega', params.fecha_entrega);
            if (params?.estado_entrega) query.append('estado_entrega', params.estado_entrega);
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

    const fetchResumenEntregas = useCallback(async (params?: { fecha_entrega?: string }) => {
        setLoadingResumen(true);
        setErrorResumen('');
        try {
            const query = new URLSearchParams();
            if (params?.fecha_entrega) query.append('fecha_entrega', params.fecha_entrega);
            const suffix = query.toString() ? `?${query}` : '';
            const data = await fetchWithAuth<Entrega[]>(`entregas${suffix}`);
            setEntregasResumen(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error en fetchResumenEntregas:', error);
            setEntregasResumen([]);
            setErrorResumen(
                error instanceof Error
                    ? error.message
                    : 'No se pudo cargar el resumen de entregas.',
            );
        } finally {
            setLoadingResumen(false);
        }
    }, []);

    const fetchPendientesTransito = useCallback(async (params?: {
        id_operacion?: number;
        id_calidad?: number;
        fecha_carga?: string;
    }) => {
        setLoadingPendientes(true);
        setErrorPendientes('');
        try {
            const query = new URLSearchParams();
            if (params?.id_operacion) query.append('id_operacion', params.id_operacion.toString());
            if (params?.id_calidad) query.append('id_calidad', params.id_calidad.toString());
            if (params?.fecha_carga) query.append('fecha_carga', params.fecha_carga);
            const suffix = query.toString() ? `?${query}` : '';
            const data = await fetchWithAuth<EntregaPendienteTransito[]>(
                `entregas/pendientes-transito${suffix}`,
            );
            setPendientesTransito(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error en fetchPendientesTransito:', error);
            setPendientesTransito([]);
            setErrorPendientes(
                error instanceof Error
                    ? error.message
                    : 'No se pudieron cargar las entregas pendientes.',
            );
        } finally {
            setLoadingPendientes(false);
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
        entregasResumen,
        pendientesTransito,
        loading,
        loadingResumen,
        loadingPendientes,
        errorPendientes,
        errorResumen,
        fetchEntregas,
        fetchResumenEntregas,
        fetchPendientesTransito,
        createEntrega,
        updateEntrega,
        changeState,
        firmarEntrega,
    };
};
