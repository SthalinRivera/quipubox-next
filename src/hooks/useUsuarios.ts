// hooks/useUsuarios.ts
'use client';
import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useUsuariosStore } from '@/stores/usuariosStore';
import type { Usuario } from '@/types/usuario';

export const useUsuarios = () => {
    const { usuarios, setUsuarios, updateUsuario, removeUsuario } = useUsuariosStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Usuario[]>('usuarios');
            setUsuarios(data);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setUsuarios]);
    const createFull = useCallback(async (data: any) => {
        return fetchWithAuth('usuarios/full', { method: 'POST', body: data });
    }, []);

    const updateFull = useCallback(async (id: number, data: any) => {
        return fetchWithAuth(`usuarios/${id}/full`, { method: 'PUT', body: data });
    }, []);
    const create = useCallback(async (usuario: any) => {
        setLoading(true);
        try {
            const newUser = await fetchWithAuth<Usuario>('usuarios', { method: 'POST', body: usuario });
            setUsuarios([newUser, ...usuarios]);
            return newUser;
        } finally {
            setLoading(false);
        }
    }, [usuarios, setUsuarios]);

    const update = useCallback(async (id: number, data: any) => {
        setLoading(true);
        try {
            const updated = await fetchWithAuth<Usuario>(`usuarios/${id}`, { method: 'PUT', body: data });
            updateUsuario(id, updated);
            return updated;
        } finally {
            setLoading(false);
        }
    }, [updateUsuario]);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        setLoading(true);
        try {
            const updated = await fetchWithAuth<Usuario>(`usuarios/${id}/estado`, {
                method: 'PATCH',
                body: { estado },
            });
            updateUsuario(id, updated);
            return updated;
        } finally {
            setLoading(false);
        }
    }, [updateUsuario]);


    const assignRole = useCallback(async (usuarioId: number, rolId: number) => {
        setLoading(true);
        try {
            await fetchWithAuth(`usuarios/${usuarioId}/roles`, { method: 'POST', body: { id_rol_usuario: rolId } });
            const updatedUser = await fetchWithAuth<Usuario>(`usuarios/${usuarioId}`);
            updateUsuario(usuarioId, updatedUser);
            return updatedUser;
        } finally {
            setLoading(false);
        }
    }, [updateUsuario]);

    const removeRole = useCallback(async (usuarioId: number, rolId: number) => {
        setLoading(true);
        try {
            await fetchWithAuth(`usuarios/${usuarioId}/roles/${rolId}`, { method: 'DELETE' });
            const updatedUser = await fetchWithAuth<Usuario>(`usuarios/${usuarioId}`);
            updateUsuario(usuarioId, updatedUser);
        } finally {
            setLoading(false);
        }
    }, [updateUsuario]);

    return {
        usuarios,
        loading,
        error,
        fetchAll,
        create,
        update,
        toggleEstado,
        assignRole,
        removeRole,
    };
};