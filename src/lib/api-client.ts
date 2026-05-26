// src/lib/api-client.ts
import { createClient } from './supabase/client';

// Definición propia para las opciones de fetch, permitiendo body de cualquier tipo (luego lo serializamos a JSON)
interface FetchWithAuthOptions {
    method?: string;
    headers?: HeadersInit;
    body?: any;          // acepta cualquier valor, lo convertiremos a JSON si es objeto
    signal?: AbortSignal;
    [key: string]: any;  // para otras opciones de fetch (cache, credentials, etc.)
}

export const fetchWithAuth = async <T>(
    url: string,
    options?: FetchWithAuthOptions
): Promise<T> => {
    if (typeof window === 'undefined') {
        throw new Error('fetchWithAuth solo puede usarse en el cliente');
    }

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('No hay sesión activa');
    }

    const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const fullUrl = `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

    const makeRequest = async (token: string): Promise<T> => {
        const isFormData = options?.body instanceof FormData;
        const headers: HeadersInit = {
            Authorization: `Bearer ${token}`,
            ...(options?.headers ?? {}),
        };
        if (!isFormData && options?.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const fetchOptions: RequestInit = {
            method: options?.method,
            headers,
            signal: options?.signal,
            cache: options?.cache,
            credentials: options?.credentials,
            mode: options?.mode,
            // ... otras propiedades que quieras pasar
        };

        if (!isFormData && options?.body !== undefined) {
            // Si es un objeto (y no FormData), serializamos a JSON
            if (typeof options.body === 'object' && !(options.body instanceof FormData)) {
                fetchOptions.body = JSON.stringify(options.body);
            } else {
                // Si ya es string, FormData, Blob, etc., lo pasamos directamente
                fetchOptions.body = options.body as BodyInit;
            }
        }

        const response = await fetch(fullUrl, fetchOptions);
        if (!response.ok) {
            const error = new Error(`HTTP error! status: ${response.status}`);
            (error as any).response = response;
            throw error;
        }
        const data = await response.json();
        return data as T;
    };

    try {
        return await makeRequest(session.access_token);
    } catch (error: any) {
        if (error.response?.status === 401) {
            const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError || !refreshed.session) {
                throw new Error('No se pudo renovar la sesión');
            }
            return await makeRequest(refreshed.session.access_token);
        }
        throw error;
    }
};