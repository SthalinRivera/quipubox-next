import { useState, useCallback, useRef } from 'react';
import { fetchWithAuth, fetchAllWithAuth } from '@/lib/api-client';
import {
    Entrega,
    EntregaPendienteTransito,
    CreateEntregaDto,
} from '@/types/entrega';

interface EntregasQuery {
    id_operacion?: number;
    id_calidad?: number;
    id_guia?: number;
    id_item_reparto?: number;
    fecha_entrega?: string;
    estado_entrega?: string;
    page?: number;
    limit?: number;
}

interface EntregasPage {
    data: Entrega[];
    total: number;
    page: number;
    limit: number;
}

export const useEntregas = () => {
    const [entregas, setEntregas] = useState<Entrega[]>([]);
    const [resumen, setResumen] = useState<Record<string, number>>({});
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
    const [pendientesTransito, setPendientesTransito] = useState<EntregaPendienteTransito[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingResumen, setLoadingResumen] = useState(true);
    const [loadingPendientes, setLoadingPendientes] = useState(false);
    const [errorPendientes, setErrorPendientes] = useState('');
    const [errorResumen, setErrorResumen] = useState('');
    const requestId = useRef(0);
    const resumenRequestId = useRef(0);
    const currentQuery = useRef<EntregasQuery>({});

    const fetchEntregas = useCallback(async (params: EntregasQuery = currentQuery.current) => {
        params = { ...currentQuery.current, ...params };
        currentQuery.current = params;
        const request = ++requestId.current;
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: String(params.page ?? 1),
                limit: String(params.limit ?? 10),
            });
            if (params?.id_operacion) query.append('id_operacion', params.id_operacion.toString());
            if (params?.id_calidad) query.append('id_calidad', params.id_calidad.toString());
            if (params?.id_guia) query.append('id_guia', params.id_guia.toString());
            if (params?.id_item_reparto) query.append('id_item_reparto', params.id_item_reparto.toString());
            if (params?.fecha_entrega) query.append('fecha_entrega', params.fecha_entrega);
            if (params?.estado_entrega) query.append('estado_entrega', params.estado_entrega);
            const response = await fetchWithAuth<EntregasPage>(`entregas?${query}`);
            const lastPage = Math.max(1, Math.ceil(response.total / response.limit));
            let result = response;
            if (response.page > lastPage) {
                query.set('page', String(lastPage));
                result = await fetchWithAuth<EntregasPage>(`entregas?${query}`);
            }
            if (request !== requestId.current) return;
            currentQuery.current = { ...params, page: result.page, limit: result.limit };
            setEntregas(result.data);
            setPagination({ total: result.total, page: result.page, limit: result.limit });
        } catch (error) {
            if (request !== requestId.current) return;
            console.error('Error en fetchEntregas:', error);
            setEntregas([]);
            setPagination({ total: 0, page: 1, limit: params.limit ?? 10 });
        } finally {
            if (request === requestId.current) setLoading(false);
        }
    }, []);

    const fetchResumenEntregas = useCallback(async (params?: { fecha_entrega?: string }) => {
        const request = ++resumenRequestId.current;
        setLoadingResumen(true);
        setErrorResumen('');
        try {
            const query = new URLSearchParams({ page: '1', limit: '100' });
            if (params?.fecha_entrega) query.append('fecha_entrega', params.fecha_entrega);
            const firstPage = await fetchWithAuth<EntregasPage>(`entregas?${query}`);
            const counts: Record<string, number> = {};
            const addCounts = (data: Entrega[]) => {
                for (const entrega of data) {
                    counts[entrega.estado_entrega] = (counts[entrega.estado_entrega] || 0) + 1;
                }
            };
            addCounts(firstPage.data);
            const totalPages = Math.ceil(firstPage.total / firstPage.limit);
            for (let page = 2; page <= totalPages; page++) {
                if (request !== resumenRequestId.current) return;
                query.set('page', String(page));
                const nextPage = await fetchWithAuth<EntregasPage>(`entregas?${query}`);
                addCounts(nextPage.data);
            }
            if (request === resumenRequestId.current) setResumen(counts);
        } catch (error) {
            if (request !== resumenRequestId.current) return;
            console.error('Error en fetchResumenEntregas:', error);
            setResumen({});
            setErrorResumen(
                error instanceof Error
                    ? error.message
                    : 'No se pudo cargar el resumen de entregas.',
            );
        } finally {
            if (request === resumenRequestId.current) setLoadingResumen(false);
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
            const data = await fetchAllWithAuth<EntregaPendienteTransito>(
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
        ...pagination,
        resumen,
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
