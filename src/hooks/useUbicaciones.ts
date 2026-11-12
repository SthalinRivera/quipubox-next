'use client';
import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Ubicacion } from '@/types/ubicacion';
export const useUbicaciones = () => {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try { setUbicaciones(await fetchWithAuth<Ubicacion[]>('ubicaciones')); }
    catch (e) { setError(e instanceof Error ? e : new Error('No se pudieron cargar las ubicaciones')); }
    finally { setLoading(false); }
  }, []);
  return { ubicaciones, loading, error, fetchAll };
};
