'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
const pending = new Map<string, Promise<unknown>>();
// Share only concurrent reads; never retain catalogues between users or modal openings.
export function useOpcionesFlujo<T>(pantalla: string, params: Record<string, string | number | null | undefined>, enabled = true) {
  const user = useAuthStore(s => s.user);
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '' && v !== 0) query.set(k, String(v)); });
  const url = `opciones-flujo/${pantalla}?${query}`;
  const key = `${user?.id_empresa}:${user?.id}:${url}`;
  const [result, setResult] = useState<{key: string; data?: T; error?: string}>({key: ''});
  useEffect(() => {
    if (!enabled) { setResult({key: ''}); return; }
    let active = true;
    setResult({key: ''});
    let request = pending.get(key);
    if (!request) {
      request = fetchWithAuth<T>(url);
      pending.set(key, request);
      void request.finally(() => { if (pending.get(key) === request) pending.delete(key); }).catch(() => {});
    }
    request.then(data => { if (active) setResult({key, data: data as T}); }, error => { if (active) setResult({key, error: error.message || 'No se pudieron cargar las opciones.'}); });
    return () => { active = false; };
  }, [key, url, enabled]);
  return { data: enabled && result.key === key ? result.data : undefined, loading: enabled && result.key !== key, error: enabled && result.key === key ? result.error : undefined };
}
