'use client';
import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Modulo } from '@/types/configuracion';

export const useModulos = () => {
    const [modulos, setModulos] = useState<Modulo[]>([]);
    const [loading, setLoading] = useState(false);
    const [mutating, setMutating] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Modulo[]>('modulos');
            setModulos(data);
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (dto: Omit<Modulo, 'id_modulo' | 'created_at' | 'updated_at' | 'categorias'>) => {
        setMutating(true);
        try {
            const nuevo = await fetchWithAuth<Modulo>('modulos', {
                method: 'POST',
                body: dto,
            });
            setModulos((prev) => [...prev, nuevo]);
            return nuevo;
        } finally {
            setMutating(false);
        }
    }, []);

    const update = useCallback(async (id: number, dto: Partial<Modulo>) => {
        setMutating(true);
        try {
            const actualizado = await fetchWithAuth<Modulo>(`modulos/${id}`, {
                method: 'PUT',
                body: dto,
            });
            setModulos((prev) => prev.map((m) => (m.id_modulo === id ? actualizado : m)));
            return actualizado;
        } finally {
            setMutating(false);
        }
    }, []);

    const toggleEstado = useCallback(async (id: number, estado: boolean) => {
        const actualizado = await fetchWithAuth<Modulo>(`modulos/${id}/estado`, {
            method: 'PATCH',
            body: { estado },
        });
        setModulos((prev) => prev.map((m) => (m.id_modulo === id ? actualizado : m)));
        return actualizado;
    }, []);

    const remove = useCallback(async (id: number) => {
        setMutating(true);
        try {
            await fetchWithAuth(`modulos/${id}`, { method: 'DELETE' });
            setModulos((prev) => prev.filter((m) => m.id_modulo !== id));
        } finally {
            setMutating(false);
        }
    }, []);

    return { modulos, loading, mutating, fetchAll, create, update, toggleEstado, remove };
};
