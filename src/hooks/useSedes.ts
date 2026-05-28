'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Sede } from '@/types/sede';

export const useSedes = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async (tipo?: string) => {
    setLoading(true);
    try {
      const url = tipo ? `sedes?tipo=${tipo}` : 'sedes';
      const data = await fetchWithAuth<Sede[]>(url);
      setSedes(data);
    } catch (error) {
      console.error('Error fetching sedes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (sede: Partial<Sede>) => {
    const newSede = await fetchWithAuth<Sede>('sedes', {
      method: 'POST',
      body: sede,
    });
    await fetchAll();
    return newSede;
  };

  const update = async (id: number, sede: Partial<Sede>) => {
    const updated = await fetchWithAuth<Sede>(`sedes/${id}`, {
      method: 'PUT',
      body: sede,
    });
    await fetchAll();
    return updated;
  };

  const remove = async (id: number) => {
    await fetchWithAuth(`sedes/${id}`, { method: 'DELETE' });
    await fetchAll();
  };

  return { sedes, loading, fetchAll, create, update, remove };
};