// src/lib/env.ts


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const env = {
    supabaseUrl,
    supabaseKey,
    apiBaseUrl,
}