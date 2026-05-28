'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Seccion } from '@/types/seccion';

export const useSecciones = () => {
    const [secciones, setSecciones] = useState<Seccion[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Seccion[]>('puestos/secciones'); // ajusta URL según tu backend
            setSecciones(data);
            return data;
        } catch (error) {
            console.error('Error fetching all secciones:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchByPuesto = useCallback(async (puestoId: number) => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Seccion[]>(`puestos/${puestoId}/secciones`);
            setSecciones(data);
            return data;
        } catch (error) {
            console.error('Error fetching secciones by puesto:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const create = async (seccion: Partial<Seccion>) => {
        const newSeccion = await fetchWithAuth<Seccion>('puestos/secciones', { method: 'POST', body: seccion });
        await fetchAll();
        return newSeccion;
    };

    const update = async (id: number, seccion: Partial<Seccion>) => {
        const updated = await fetchWithAuth<Seccion>(`puestos/secciones/${id}`, { method: 'PUT', body: seccion });
        await fetchAll();
        return updated;
    };

    const remove = async (id: number) => {
        await fetchWithAuth(`puestos/secciones/${id}`, { method: 'DELETE' });
        await fetchAll();
    };

    return { secciones, loading, fetchAll, fetchByPuesto, create, update, remove };
};