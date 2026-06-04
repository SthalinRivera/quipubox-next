import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { DetalleCarga, CreateDetalleCargaDto, DetalleCalidad, CreateDetalleCalidadDto } from '@/types/detalleCarga';

export const useDetallesCarga = (operacionId: number) => {
    const [detalles, setDetalles] = useState<DetalleCarga[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchDetalles = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<any>(`operaciones-carga/${operacionId}/detalles`);
            if (Array.isArray(data)) {
                setDetalles(data);
            } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
                setDetalles(data.data);
            } else {
                setDetalles([]);
            }
        } catch (error) {
            console.error('Error fetching detalles:', error);
            setDetalles([]);
        } finally {
            setLoading(false);
        }
    }, [operacionId]);

    const createDetalle = async (dto: CreateDetalleCargaDto) => {
        const newDetalle = await fetchWithAuth<DetalleCarga>(`operaciones-carga/${operacionId}/detalles`, {
            method: 'POST',
            body: dto,
        });
        await fetchDetalles();
        return newDetalle;
    };

    const updateDetalle = async (id: number, dto: Partial<CreateDetalleCargaDto>) => {
        const updated = await fetchWithAuth<DetalleCarga>(`detalle-carga/${id}`, {
            method: 'PUT',
            body: dto,
        });
        await fetchDetalles();
        return updated;
    };

    const deleteDetalle = async (id: number) => {
        await fetchWithAuth(`detalle-carga/${id}`, { method: 'DELETE' });
        await fetchDetalles();
    };

    // Calidades
    const fetchCalidades = async (detalleId: number) => {
        return await fetchWithAuth<DetalleCalidad[]>(`detalle-carga/${detalleId}/calidades`);
    };

    const addCalidad = async (detalleId: number, dto: CreateDetalleCalidadDto) => {
        const newCalidad = await fetchWithAuth<DetalleCalidad>(`detalle-carga/${detalleId}/calidades`, {
            method: 'POST',
            body: dto,
        });
        await fetchDetalles(); // refrescar todo para mostrar calidades actualizadas
        return newCalidad;
    };

    const updateCalidad = async (calidadId: number, dto: Partial<CreateDetalleCalidadDto>) => {
        const updated = await fetchWithAuth<DetalleCalidad>(`detalle-carga/calidades/${calidadId}`, {
            method: 'PUT',
            body: dto,
        });
        await fetchDetalles();
        return updated;
    };

    const deleteCalidad = async (calidadId: number) => {
        await fetchWithAuth(`detalle-carga/calidades/${calidadId}`, { method: 'DELETE' });
        await fetchDetalles();
    };

    return {
        detalles,
        loading,
        fetchDetalles,
        createDetalle,
        updateDetalle,
        deleteDetalle,
        fetchCalidades,
        addCalidad,
        updateCalidad,
        deleteCalidad,
    };
};