'use client';
import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { ModuloAsignado } from '@/types/configuracion';

export const useRolesModulos = () => {
    const [modulosAsignados, setModulosAsignados] = useState<ModuloAsignado[]>([]);
    const [loading, setLoading] = useState(false);
    const [mutating, setMutating] = useState(false);

    const fetchByRol = useCallback(async (rolId: number) => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<ModuloAsignado[]>(`roles-modulos/rol/${rolId}`);
            setModulosAsignados(data);
            return data;
        } finally {
            setLoading(false);
        }
    }, []);

    const assignAll = useCallback(async (rolId: number, moduloIds: number[], usuarioAsigno?: number) => {
        setMutating(true);
        try {
            const result = await fetchWithAuth<{ message: string; count: number }>('roles-modulos/assign', {
                method: 'POST',
                body: {
                    rol_id: rolId,
                    modulo_ids: moduloIds,
                    usuario_asigno: usuarioAsigno,
                },
            });
            return result;
        } finally {
            setMutating(false);
        }
    }, []);

    const toggle = useCallback(async (rolId: number, moduloId: number, usuarioAsigno?: number) => {
        setMutating(true);
        try {
            const result = await fetchWithAuth<{ assigned: boolean; message: string }>(
                `roles-modulos/toggle/${rolId}/${moduloId}`,
                {
                    method: 'POST',
                    body: { usuario_asigno: usuarioAsigno },
                },
            );
            return result;
        } finally {
            setMutating(false);
        }
    }, []);

    return { modulosAsignados, loading, mutating, fetchByRol, assignAll, toggle };
};
