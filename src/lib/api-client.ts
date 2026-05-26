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
    return data as T;
};