// src/hooks/useIncidencias.ts
'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useIncidenciasStore } from '@/stores/incidenciasStore';
import type { Incidencia } from '@/types/incidencia';

export const useIncidencias = () => {
    const { incidencias, setIncidencias, addIncidencia, updateIncidencia, removeIncidencia } =
        useIncidenciasStore();
    const [loading, setLoading] = useState(false);
    const [mutating, setMutating] = useState(false);
    const [error, setError] = useState<any>(null);

    // Obtener todas las incidencias
    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth<Incidencia[]>('incidencias');
            // Nota: las evidencias vienen incluidas porque el backend las agrupa
            setIncidencias(data);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setIncidencias]);

    // Crear una incidencia (con archivos)
    const create = useCallback(
        async (formData: FormData) => {
            setMutating(true);
            setError(null);
            try {
                // Al usar FormData, fetchWithAuth no agrega Content-Type: application/json
                const newIncidencia = await fetchWithAuth<Incidencia>('incidencias', {
                    method: 'POST',
                    body: formData,
                });
                addIncidencia(newIncidencia);
                return newIncidencia;
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setMutating(false);
            }
        },
        [addIncidencia]
    );

    // Actualizar una incidencia (sin archivos, solo datos)
    const update = useCallback(
        async (id: number, data: Partial<Incidencia>) => {
            setMutating(true);
            setError(null);
            try {
                const updated = await fetchWithAuth<Incidencia>(`incidencias/${id}`, {
                    method: 'PATCH',
                    body: data,
                });
                updateIncidencia(id, updated);
                return updated;
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setMutating(false);
            }
        },
        [updateIncidencia]
    );

    // Actualizar con archivos (si se suben nuevos)
    const updateWithFiles = useCallback(
        async (id: number, formData: FormData) => {
            setMutating(true);
            setError(null);
            try {
                const updated = await fetchWithAuth<Incidencia>(`incidencias/${id}`, {
                    method: 'PATCH',
                    body: formData,
                });
                updateIncidencia(id, updated);
                return updated;
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setMutating(false);
            }
        },
        [updateIncidencia]
    );

    // Eliminar incidencia
    const remove = useCallback(
        async (id: number) => {
            setMutating(true);
            setError(null);
            try {
                await fetchWithAuth(`incidencias/${id}`, { method: 'DELETE' });
                removeIncidencia(id);
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setMutating(false);
            }
        },
        [removeIncidencia]
    );

    // Cambiar estado (abierta / cerrada)
    const toggleEstado = useCallback(
        async (id: number, estado: string) => {
            try {
                const updated = await fetchWithAuth<Incidencia>(`incidencias/${id}/estado`, {
                    method: 'PATCH',
                    body: { estado },
                });
                updateIncidencia(id, updated);
                return updated;
            } catch (err) {
                throw err;
            }
        },
        [updateIncidencia]
    );

    return {
        incidencias,
        loading,
        mutating,
        error,
        fetchAll,
        create,
        update,
        updateWithFiles,
        remove,
        toggleEstado,
    };
};