import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { GuiaOperativa, CreateGuiaOperativaDto } from '@/types/guiaOperativa';

export const useGuiasOperativas = () => {
    const [guias, setGuias] = useState<GuiaOperativa[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchGuias = useCallback(async (params?: { estado?: string; fecha_emision?: string }) => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (params?.estado) query.append('estado', params.estado);
            if (params?.fecha_emision) query.append('fecha_emision', params.fecha_emision);
            const url = `guias-operativas${query.toString() ? `?${query}` : ''}`;
            const data = await fetchWithAuth<GuiaOperativa[]>(url);
            setGuias(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setGuias([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createGuia = async (dto: CreateGuiaOperativaDto) => {
        const newGuia = await fetchWithAuth<GuiaOperativa>('guias-operativas', {
            method: 'POST',
            body: dto,
        });
        await fetchGuias();
        return newGuia;
    };

    const updateGuia = async (id: number, dto: Partial<CreateGuiaOperativaDto>) => {
        const updated = await fetchWithAuth<GuiaOperativa>(`guias-operativas/${id}`, {
            method: 'PUT',
            body: dto,
        });
        await fetchGuias();
        return updated;
    };

    const deleteGuia = async (id: number) => {
        await fetchWithAuth(`guias-operativas/${id}`, { method: 'DELETE' });
        await fetchGuias();
    };

    const firmarGuia = async (id: number) => {
        await fetchWithAuth(`guias-operativas/${id}/firmar`, { method: 'PATCH' });
        await fetchGuias();
    };

    const changeGuiaState = async (id: number, estado: string) => {
        await fetchWithAuth(`guias-operativas/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        await fetchGuias();
    };

    return {
        guias,
        loading,
        fetchGuias,
        createGuia,
        updateGuia,
        deleteGuia,
        firmarGuia,
        changeGuiaState,
    };
};