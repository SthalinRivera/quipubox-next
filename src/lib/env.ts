// src/lib/env.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Validación en tiempo de ejecución (solo si estamos en el servidor o build)
const validateUrl = (url: string | undefined, name: string): string => {
    if (!url) throw new Error(`Missing ${name}`);
    try {
        new URL(url);
        return url;
    } catch {
        throw new Error(`Invalid ${name}: ${url}`);
    }
};

export const env = {
    get supabaseUrl() {
        return validateUrl(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL');
    },
    get supabaseKey() {
        if (!supabaseKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
        return supabaseKey;
    },
    get apiBaseUrl() {
        // No lanzamos error, pero podríamos validar y devolver un valor por defecto
        return apiBaseUrl?.replace(/\/$/, '') || ''; // eliminar slash final
    },
};