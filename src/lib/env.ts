// src/lib/env.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// NO lanzamos error aquí, solo lo guardamos en un objeto que lanzará error al acceder si falta
export const env = {
    get supabaseUrl() {
        if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
        return supabaseUrl;
    },
    get supabaseKey() {
        if (!supabaseKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
        return supabaseKey;
    },
    get apiBaseUrl() {
        return apiBaseUrl || ''; // puede estar vacío, no es crítico
    },
};