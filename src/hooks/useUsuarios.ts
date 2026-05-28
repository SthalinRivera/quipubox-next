'use client';

import { useState, useCallback, useRef } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Usuario } from '@/types/usuario';

interface ErrorState {
    message: string;
    status?: number;
}

// Caché global
let cachedUsuarios: Usuario[] | null = null;
let activePromise: Promise<Usuario[] | null> | null = null; // ✅ permite null

export const useUsuarios = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>(cachedUsuarios || []);
    const [loading, setLoading] = useState(!cachedUsuarios);
    const [error, setError] = useState<ErrorState | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleFetchError = (error: any): ErrorState => {
        if (error.response?.status === 404) return { message: 'Recurso no encontrado', status: 404 };
        if (error.response?.status === 401) return { message: 'No autorizado', status: 401 };
        if (error.response?.status === 409) return { message: 'Conflicto de datos', status: 409 };
        return { message: error.message || 'Error de conexión' };
    };

    const fetchAll = useCallback(async (force = false): Promise<Usuario[] | null> => {
        if (force) {
            cachedUsuarios = null;
            activePromise = null;
        }
        if (cachedUsuarios && !force) {
            setUsuarios(cachedUsuarios);
            setLoading(false);
            return cachedUsuarios;
        }
        if (activePromise) {
            const data = await activePromise;
            if (data) setUsuarios(data);
            setLoading(false);
            return data;
        }

        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        setLoading(true);
        setError(null);

        const promise = fetchWithAuth<Usuario[]>('usuarios', { signal: controller.signal })
            .then(data => {
                cachedUsuarios = data;
                setUsuarios(data);
                return data;
            })
            .catch(err => {
                if (err.name === 'AbortError') {
                    console.log('Petición cancelada');
                    return null;
                }
                const errState = handleFetchError(err);
                setError(errState);
                throw err;
            })
            .finally(() => {
                setLoading(false);
                activePromise = null;
                abortControllerRef.current = null;
            });
        activePromise = promise;
        return promise;
    }, []);

    const create = async (usuario: Omit<Usuario, 'id_usuario' | 'created_at' | 'empresas' | 'sedes' | 'usuarios_roles'> & { estado?: boolean }) => {
        setLoading(true);
        setError(null);
        try {
            const newUsuario = await fetchWithAuth<Usuario>('usuarios', { method: 'POST', body: usuario });
            const newList = cachedUsuarios ? [newUsuario, ...cachedUsuarios] : [newUsuario];
            cachedUsuarios = newList;
            setUsuarios(newList);
            return newUsuario;
        } catch (err: any) {
            const errState = handleFetchError(err);
            setError(errState);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const update = async (id: number, usuario: Partial<Omit<Usuario, 'id_usuario' | 'created_at' | 'empresas' | 'sedes' | 'usuarios_roles'>>) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await fetchWithAuth<Usuario>(`usuarios/${id}`, { method: 'PUT', body: usuario });
            if (cachedUsuarios) {
                const newList = cachedUsuarios.map(u => u.id_usuario === id ? updated : u);
                cachedUsuarios = newList;
                setUsuarios(newList);
            } else {
                setUsuarios(prev => prev.map(u => u.id_usuario === id ? updated : u));
            }
            return updated;
        } catch (err: any) {
            const errState = handleFetchError(err);
            setError(errState);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await fetchWithAuth(`usuarios/${id}`, { method: 'DELETE' });
            if (cachedUsuarios) {
                const newList = cachedUsuarios.filter(u => u.id_usuario !== id);
                cachedUsuarios = newList;
                setUsuarios(newList);
            } else {
                setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
            }
        } catch (err: any) {
            const errState = handleFetchError(err);
            setError(errState);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const bloquear = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await fetchWithAuth<Usuario>(`usuarios/${id}/bloquear`, { method: 'PATCH' });
            if (cachedUsuarios) {
                const newList = cachedUsuarios.map(u => u.id_usuario === id ? updated : u);
                cachedUsuarios = newList;
                setUsuarios(newList);
            } else {
                setUsuarios(prev => prev.map(u => u.id_usuario === id ? updated : u));
            }
        } catch (err: any) {
            const errState = handleFetchError(err);
            setError(errState);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const activar = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await fetchWithAuth<Usuario>(`usuarios/${id}/activar`, { method: 'PATCH' });
            if (cachedUsuarios) {
                const newList = cachedUsuarios.map(u => u.id_usuario === id ? updated : u);
                cachedUsuarios = newList;
                setUsuarios(newList);
            } else {
                setUsuarios(prev => prev.map(u => u.id_usuario === id ? updated : u));
            }
        } catch (err: any) {
            const errState = handleFetchError(err);
            setError(errState);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const assignRole = async (usuarioId: number, rolId: number) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await fetchWithAuth<Usuario>(`usuarios/${usuarioId}/roles`, {
                method: 'POST',
                body: { id_rol: rolId }
            });
            if (cachedUsuarios) {
                const newList = cachedUsuarios.map(u => u.id_usuario === usuarioId ? updated : u);
                cachedUsuarios = newList;
                setUsuarios(newList);
            } else {
                setUsuarios(prev => prev.map(u => u.id_usuario === usuarioId ? updated : u));
            }
            return updated;
        } catch (err: any) {
            const errState = handleFetchError(err);
            setError(errState);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeRole = async (usuarioId: number, rolId: number) => {
        setLoading(true);
        setError(null);
        try {
            await fetchWithAuth(`usuarios/${usuarioId}/roles/${rolId}`, { method: 'DELETE' });
            await fetchAll(true);
        } catch (err: any) {
            const errState = handleFetchError(err);
            setError(errState);
            throw err;
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