// hooks/useSedes.ts
'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useSedesDataStore } from '@/stores/sedesDataStore'; // ✅ import correcto
import type { Sede } from '@/types/sede';

export const useSedes = () => {
  const { sedes, setSedes, addSede, updateSede } = useSedesDataStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchAll = useCallback(async (tipo?: string, idEmpresa?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tipo) params.append('tipo', tipo);
      if (idEmpresa !== undefined) params.append('empresa', idEmpresa.toString());
      const url = params.toString() ? `sedes?${params}` : 'sedes';
      const data = await fetchWithAuth<Sede[]>(url);
      setSedes(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [setSedes]);

  const create = useCallback(async (sedeData: Partial<Sede>) => {
    try {
      const newSede = await fetchWithAuth<Sede>('sedes', {
        method: 'POST',
        body: sedeData,
      });
      addSede(newSede);
      return newSede;
    } catch (err) {
      throw err;
    }
  }, [addSede]);

  const update = useCallback(async (id: number, sedeData: Partial<Sede>) => {
    try {
      const updated = await fetchWithAuth<Sede>(`sedes/${id}`, {
        method: 'PUT',
        body: sedeData,
      });
      updateSede(id, updated);
      return updated;
    } catch (err) {
      throw err;
    }
  }, [updateSede]);

  const toggleEstado = useCallback(async (id: number, estado: boolean) => {
    try {
      const updated = await fetchWithAuth<Sede>(`sedes/${id}/estado`, {
        method: 'PATCH',
        body: { estado },
      });
      updateSede(id, updated);
      return updated;
    } catch (err) {
      throw err;
    }
  }, [updateSede]);

  return { sedes, loading, error, fetchAll, create, update, toggleEstado };
};