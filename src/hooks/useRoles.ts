// hooks/useRoles.ts
'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Rol } from '@/types/rol';

export const useRoles = () => {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Rol[]>('roles-usuarios');
            setRoles(data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (rol: Partial<Rol>) => {
        const newRol = await fetchWithAuth<Rol>('roles-usuarios', {
            method: 'POST',
            body: rol,
        });
        setRoles(prev => [...prev, newRol]);
        return newRol;
    }, []);

    const update = useCallback(async (id: number, rol: Partial<Rol>) => {
        const updated = await fetchWithAuth<Rol>(`roles-usuarios/${id}`, {
            method: 'PATCH', // Cambiado de PUT a PATCH
            body: rol,
        });
        setRoles(prev => prev.map(r => r.id_rol_usuario === id ? updated : r));
        return updated;
    }, []);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        const updated = await fetchWithAuth<Rol>(`roles-usuarios/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        setRoles(prev => prev.map(r => r.id_rol_usuario === id ? updated : r));
        return updated;
    }, []);

    // ❌ remove eliminado

    return { roles, loading, fetchAll, create, update, toggleEstado };
};