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

    const fetchAll = useCallback(async (force = false) => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Usuario[]>('usuarios');
            setUsuarios(data);
            return data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setUsuarios]);

    const create = async (usuario: any) => {
        setLoading(true);
        try {
            const newUser = await fetchWithAuth<Usuario>('usuarios', { method: 'POST', body: usuario });
            setUsuarios([newUser, ...usuarios]);
            return newUser;
        } finally {
            setLoading(false);
        }
    };

    const update = async (id: number, data: any) => {
        setLoading(true);
        try {
            const updated = await fetchWithAuth<Usuario>(`usuarios/${id}`, { method: 'PUT', body: data });
            updateUsuario(id, updated);
            return updated;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id: number) => {
        setLoading(true);
        try {
            await fetchWithAuth(`usuarios/${id}`, { method: 'DELETE' });
            removeUsuario(id);
        } finally {
            setLoading(false);
        }
    };

    const bloquear = async (id: number) => {
        setLoading(true);
        try {
            const updated = await fetchWithAuth<Usuario>(`usuarios/${id}/bloquear`, { method: 'PATCH' });
            updateUsuario(id, updated);
        } finally {
            setLoading(false);
        }
    };

    const activar = async (id: number) => {
        setLoading(true);
        try {
            const updated = await fetchWithAuth<Usuario>(`usuarios/${id}/activar`, { method: 'PATCH' });
            updateUsuario(id, updated);
        } finally {
            setLoading(false);
        }
    };

    const assignRole = async (usuarioId: number, rolId: number) => {
        setLoading(true);
        try {
            await fetchWithAuth(`usuarios/${usuarioId}/roles`, { method: 'POST', body: { id_rol: rolId } });
            const updatedUser = await fetchWithAuth<Usuario>(`usuarios/${usuarioId}`);
            updateUsuario(usuarioId, updatedUser);
            return updatedUser;
        } finally {
            setLoading(false);
        }
    };

    const removeRole = async (usuarioId: number, rolId: number) => {
        setLoading(true);
        try {
            await fetchWithAuth(`usuarios/${usuarioId}/roles/${rolId}`, { method: 'DELETE' });
            const updatedUser = await fetchWithAuth<Usuario>(`usuarios/${usuarioId}`);
            updateUsuario(usuarioId, updatedUser);
        } finally {
            setLoading(false);
        }
    };

    return {
        usuarios,
        loading,
        error,
        fetchAll,
        create,
        update,
        remove,
        bloquear,
        activar,
        assignRole,
        removeRole,
    };
};