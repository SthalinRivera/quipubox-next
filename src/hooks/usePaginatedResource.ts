'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWithAuth, type PaginatedResult } from '@/lib/api-client';

export function usePaginatedResource<T>(endpoint: string, filters: Record<string, string | number | undefined> = {}) {
    const filterKey = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString();
    const [position, setPosition] = useState({ key: filterKey, page: 1, limit: 10 });
    const page = position.key === filterKey ? position.page : 1;
    const limit = position.limit;
    const [result, setResult] = useState<PaginatedResult<T>>({ data: [], total: 0, page: 1, limit: 10 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const latest = useRef(0);

    const reload = useCallback(async () => {
        const request = ++latest.current;
        setLoading(true);
        setError('');
        try {
            const query = new URLSearchParams(filterKey);
            query.set('page', String(page)); query.set('limit', String(limit));
            const response = await fetchWithAuth<PaginatedResult<T>>(`${endpoint}?${query}`);
            const last = Math.max(1, Math.ceil(response.total / response.limit));
            if (request !== latest.current) return;
            if (response.page > last) {
                setPosition({ key: filterKey, page: last, limit });
                return;
            }
            setResult(response);
        } catch (err) {
            if (request !== latest.current) return;
            setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.');
            setResult({ data: [], total: 0, page, limit });
        } finally {
            if (request === latest.current) setLoading(false);
        }
    }, [endpoint, filterKey, page, limit]);

    useEffect(() => {
        const pendingRequests = latest;
        const timer = setTimeout(() => { void reload(); }, 150);
        return () => { clearTimeout(timer); pendingRequests.current++; };
    }, [reload]);
    useEffect(() => {
        const refresh = () => { void reload(); };
        window.addEventListener('api:changed', refresh);
        return () => window.removeEventListener('api:changed', refresh);
    }, [reload]);

    return {
        ...result, page, limit, loading, error, reload,
        onPageChange: (next: number) => setPosition({ key: filterKey, page: next, limit }),
        onLimitChange: (next: number) => setPosition({ key: filterKey, page: 1, limit: next }),
    };
}