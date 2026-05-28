'use client';

import { useState, useCallback, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Rol } from '@/types/rol';

export const useRoles = () => {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [loading, setLoading] = useState(true);

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

    const create = async (rol: Partial<Rol>) => {
        const newRol = await fetchWithAuth<Rol>('roles-usuarios', {
            method: 'POST',
            body: rol,
        });
        await fetchAll();
        return newRol;
    };

    const update = async (id: number, rol: Partial<Rol>) => {
        const updated = await fetchWithAuth<Rol>(`roles-usuarios/${id}`, {
            method: 'PUT',
            body: rol,
        });
        await fetchAll();
        return updated;
    };

    const remove = async (id: number) => {
        await fetchWithAuth(`roles-usuarios/${id}`, { method: 'DELETE' });
        await fetchAll();
    };

    // Carga inicial automática
    useEffect(() => {
        fetchAll();
    }, []);

    return { roles, loading, fetchAll, create, update, remove };
};