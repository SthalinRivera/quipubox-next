'use client';
import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Categoria } from '@/types/configuracion';

export const useCategorias = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(false);
    const [mutating, setMutating] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Categoria[]>('categorias');
            setCategorias(data);
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (dto: Omit<Categoria, 'id_categoria' | 'created_at' | 'updated_at' | 'modulos'>) => {
        setMutating(true);
        try {
            const nuevo = await fetchWithAuth<Categoria>('categorias', {
                method: 'POST',
                body: dto,
            });
            setCategorias((prev) => [...prev, nuevo]);
            return nuevo;
        } finally {
            setMutating(false);
        }
    }, []);

    const update = useCallback(async (id: number, dto: Partial<Categoria>) => {
        setMutating(true);
        try {
            const actualizado = await fetchWithAuth<Categoria>(`categorias/${id}`, {
                method: 'PUT',
                body: dto,
            });
            setCategorias((prev) => prev.map((c) => (c.id_categoria === id ? actualizado : c)));
            return actualizado;
        } finally {
            setMutating(false);
        }
    }, []);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        const actualizado = await fetchWithAuth<Categoria>(`categorias/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        setCategorias((prev) => prev.map((c) => (c.id_categoria === id ? actualizado : c)));
        return actualizado;
    }, []);

    const remove = useCallback(async (id: number) => {
        setMutating(true);
        try {
            await fetchWithAuth(`categorias/${id}`, { method: 'DELETE' });
            setCategorias((prev) => prev.filter((c) => c.id_categoria !== id));
        } finally {
            setMutating(false);
        }
    }, []);

    return { categorias, loading, mutating, fetchAll, create, update, toggleEstado, remove };
};
