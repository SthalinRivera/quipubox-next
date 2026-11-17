// src/lib/api-client.ts
// En lugar de llamar directamente al backend externo (que causa CORS en el navegador),
// llamamos a nuestro proxy de Next.js en /api/proxy/...
// El proxy corre en el servidor y hace la petición al backend sin restricciones CORS.

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

    // Limpiamos el path para construir la URL del proxy interno
    const cleanPath = url.replace(/^\/+/, '');
    const proxyUrl = `/api/proxy/${cleanPath}`;

    const headers: Record<string, string> = {};

    // Solo agregar Content-Type si no es FormData
    const isFormData = options?.body instanceof FormData;
    if (!isFormData && options?.body && typeof options.body === 'object') {
        headers['Content-Type'] = 'application/json';
    }

    // Mezclar headers adicionales si los hay
    if (options?.headers) {
        const extra = options.headers;
        if (typeof extra === 'object' && !Array.isArray(extra)) {
            Object.assign(headers, extra as Record<string, string>);
        }
    }

    const fetchOptions: RequestInit = {
        method: options?.method || 'GET',
        headers,
        signal: options?.signal,
    };

    // Agregar body si corresponde
    if (!['GET', 'HEAD'].includes(fetchOptions.method as string) && options?.body !== undefined) {
        if (!isFormData) {
            if (typeof options.body === 'object') {
                fetchOptions.body = JSON.stringify(options.body);
            } else {
                fetchOptions.body = options.body as BodyInit;
            }
        } else {
            fetchOptions.body = options.body;
        }
    }

    let response;
    try {
        response = await fetch(proxyUrl, fetchOptions);
    } catch (err: any) {
        console.error('Fetch error al llamar al proxy interno:', err);
        throw new Error(`Error de conexión: No se pudo alcanzar el servidor. Asegúrese de que Next.js esté corriendo.`);
    }

    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errData = await response.json();
            errorMessage = errData?.message || errData?.error || errorMessage;
        } catch {
            // no se pudo parsear el error como JSON
        }
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
    }

    const data = await response.json();
    if (fetchOptions.method !== 'GET' && typeof window !== 'undefined')
        window.dispatchEvent(new CustomEvent('api:changed', { detail: { path: cleanPath } }));
    const normalizeIds = (value: any, key = ''): any => {
        if (typeof value === 'string' && /^id(?:_|$)/.test(key) && !/ubigeo|provincia|departamento/.test(key) && /^\d+$/.test(value)) {
            const number = Number(value);
            return Number.isSafeInteger(number) ? number : value;
        }
        if (Array.isArray(value)) return value.map(item => normalizeIds(item));
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,normalizeIds(v,k)]));
        return value;
    };
    if (data && typeof data.success === 'boolean' && 'data' in data) {
        if (!data.success) throw new Error(data.message || 'Error de API');
        return normalizeIds(data.meta ? { data: data.data, ...data.meta } : data.data) as T;
    }
    return normalizeIds(data) as T;
};

export interface PaginatedResult<T> { data: T[]; total: number; page: number; limit: number; }

/** Para selectores, relaciones y exportaciones que requieren la colección completa. */
export async function fetchAllWithAuth<T>(url: string, options?: FetchWithAuthOptions): Promise<T[]> {
    const [pathname, search = ''] = url.split('?');
    const query = new URLSearchParams(search);
    query.set('page', '1');
    query.set('limit', '100');
    const first = await fetchWithAuth<PaginatedResult<T> | T[]>(`${pathname}?${query}`, options);
    if (Array.isArray(first)) return first;
    if (!first || !Array.isArray(first.data) || !Number.isFinite(first.total) || first.limit < 1)
        throw new Error('Respuesta de listado inválida.');
    const data = [...first.data];
    for (let page = 2; page <= Math.ceil(first.total / first.limit); page++) {
        if (options?.signal?.aborted) throw new Error('Solicitud cancelada.');
        query.set('page', String(page));
        const next = await fetchWithAuth<PaginatedResult<T>>(`${pathname}?${query}`, options);
        data.push(...next.data);
    }
    return data;
}
