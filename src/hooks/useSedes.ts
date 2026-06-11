// hooks/useSedes.ts
import { useState, useCallback, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Sede } from '@/types/sede';

export const useSedes = (idEmpresa?: number) => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async (tipo?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tipo) params.append('tipo', tipo);
      if (idEmpresa !== undefined) params.append('empresa', idEmpresa.toString());
      const url = params.toString() ? `sedes?${params}` : 'sedes';
      const data = await fetchWithAuth<Sede[]>(url);
      setSedes(data);
    } catch (error) {
      console.error('Error fetching sedes:', error);
    } finally {
      setLoading(false);
    }
  }, [idEmpresa]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = useCallback(async (sede: Partial<Sede>) => {
    const newSede = await fetchWithAuth<Sede>('sedes', {
      method: 'POST',
      body: sede,
    });
    // ✅ Actualización local: agregar la nueva sede al final
    setSedes(prev => [...prev, newSede]);
    return newSede;
  }, []);

  const update = useCallback(async (id: number, sede: Partial<Sede>) => {
    const updated = await fetchWithAuth<Sede>(`sedes/${id}`, {
      method: 'PATCH',
      body: sede,
    });
    // ✅ Actualización local: reemplazar la sede modificada
    setSedes(prev => prev.map(s => s.id_sede === id ? updated : s));
    return updated;
  }, []);

  const toggleEstado = useCallback(async (id: number, estado: boolean) => {
    const updated = await fetchWithAuth<Sede>(`sedes/${id}/estado`, {
      method: 'PATCH',
      body: { estado },
    });
    // ✅ Actualización local: cambiar el estado de la sede
    setSedes(prev => prev.map(s => s.id_sede === id ? updated : s));
    return updated;
  }, []);

  return { sedes, loading, fetchAll, create, update, toggleEstado };
};