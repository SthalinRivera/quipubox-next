'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { Sede } from '@/types/cliente';

export const useSedes = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSedes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth<Sede[]>('sedes');
      setSedes(data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar sedes');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sedes,
    loading,
    error,
    fetchSedes,
  };
};
