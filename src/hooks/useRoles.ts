'use client';
import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useRolesStore } from '@/stores/rolesStore';
import type { Rol } from '@/types/rol';

export const useRoles = () => {
    const { roles, setRoles, addRol, updateRol } = useRolesStore();
    const [loading, setLoading] = useState(false);      // ← solo para fetchAll
    const [mutating, setMutating] = useState(false);    // ← opcional para modales
    const [error, setError] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Rol[]>('roles-usuarios');
            setRoles(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [setRoles]);

    const create = useCallback(async (rolData: Omit<Rol, 'id_rol_usuario'>) => {
        setMutating(true);
        try {
            const newRol = await fetchWithAuth<Rol>('roles-usuarios', {
                method: 'POST',
                body: rolData,
            });
            addRol(newRol);
            return newRol;
        } finally {
            setMutating(false);
        }
    }, [addRol]);

    const update = useCallback(async (id: number, rolData: Partial<Rol>) => {
        setMutating(true);
        try {
            const updatedRol = await fetchWithAuth<Rol>(`roles-usuarios/${id}`, {
                method: 'PUT',
                body: rolData,
            });
            updateRol(id, updatedRol);
            return updatedRol;
        } finally {
            setMutating(false);
        }
    }, [updateRol]);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        // ⚠️ No toca loading → la tabla no se recarga
        try {
            const updatedRol = await fetchWithAuth<Rol>(`roles-usuarios/${id}/estado`, {
                method: 'PATCH',
                body: { estado },
            });
            updateRol(id, updatedRol);
            return updatedRol;
        } catch (err) {
            throw err;
        }
    }, [updateRol]);

    return {
        roles,
        loading,    // ← como estabas usando
        mutating,
        error,
        fetchAll,
        create,
        update,
        toggleEstado,
    };
};