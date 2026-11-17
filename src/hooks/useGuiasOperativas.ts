import { useState, useCallback, useRef } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { GuiaOperativa, CreateGuiaOperativaDto } from '@/types/guiaOperativa';

interface GuiasQuery {
    estado?: string;
    fecha_emision?: string;
    page?: number;
    limit?: number;
}
interface GuiasPage {
    data: GuiaOperativa[];
    total: number;
    page: number;
    limit: number;
}

export const useGuiasOperativas = () => {
    const [guias, setGuias] = useState<GuiaOperativa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });
    const [resumen, setResumen] = useState<Record<string, number>>({});
    const requestId = useRef(0);
    const currentQuery = useRef<GuiasQuery>({});
    const resumenCache = useRef<{ fecha?: string; data: Record<string, number> } | null>(null);

    const fetchGuias = useCallback(async (params: GuiasQuery = currentQuery.current, refreshResumen = false) => {
        params = { ...currentQuery.current, ...params };
        currentQuery.current = params;
        const request = ++requestId.current;
        setLoading(true);
        setError('');
        try {
            const query = new URLSearchParams({
                page: String(params.page ?? 1),
                limit: String(params.limit ?? 20),
            });
            if (params.estado) query.set('estado', params.estado);
            if (params.fecha_emision) query.set('fecha_emision', params.fecha_emision);
            const cached = resumenCache.current;
            const summaryQuery = new URLSearchParams();
            if (params.fecha_emision) summaryQuery.set('fecha_emision', params.fecha_emision);
            const [response, counts] = await Promise.all([
                fetchWithAuth<GuiasPage>(`guias-operativas?${query}`),
                !refreshResumen && cached && cached.fecha === params.fecha_emision
                    ? Promise.resolve(cached.data)
                    : fetchWithAuth<Record<string, number>>(`guias-operativas/resumen?${summaryQuery}`),
            ]);
            // Una anulación puede dejar vacía la última página del filtro.
            const lastPage = Math.max(1, Math.ceil(response.total / response.limit));
            let result = response;
            if (response.page > lastPage) {
                query.set('page', String(lastPage));
                result = await fetchWithAuth<GuiasPage>(`guias-operativas?${query}`);
            }
            if (request !== requestId.current) return;
            currentQuery.current = { ...params, page: result.page, limit: result.limit };
            resumenCache.current = { fecha: params.fecha_emision, data: counts };
            setGuias(result.data);
            setPagination({ total: result.total, page: result.page, limit: result.limit });
            setResumen(counts);
        } catch (err) {
            if (request !== requestId.current) return;
            setError(err instanceof Error ? err.message : 'No se pudieron cargar las guías.');
            setGuias([]);
            setResumen({});
            setPagination({ total: 0, page: 1, limit: params.limit ?? 20 });
        } finally {
            if (request === requestId.current) setLoading(false);
        }
    }, []);
    const createGuia = async (dto: CreateGuiaOperativaDto) => {
        const newGuia = await fetchWithAuth<GuiaOperativa>('guias-operativas', {
            method: 'POST',
            body: dto,
        });

        return newGuia;
    };

    const updateGuia = async (id: number, dto: Partial<CreateGuiaOperativaDto>) => {
        const updated = await fetchWithAuth<GuiaOperativa>(`guias-operativas/${id}`, {
            method: 'PUT',
            body: dto,
        });

        return updated;
    };

    const deleteGuia = async (id: number) => {
        await fetchWithAuth(`guias-operativas/${id}`, { method: 'DELETE' });

    };

    const firmarGuia = async (id: number) => {
        await fetchWithAuth(`guias-operativas/${id}/firmar`, { method: 'PATCH' });

    };

    const changeGuiaState = async (id: number, estado: string) => {
        await fetchWithAuth(`guias-operativas/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });

    };

    return {
        guias,
        ...pagination, resumen, error,
        loading,
        fetchGuias,
        createGuia,
        updateGuia,
        deleteGuia,
        firmarGuia,
        changeGuiaState,
    };
};