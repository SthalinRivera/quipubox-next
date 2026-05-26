import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const defaultCookieOptions = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
};

export const createClient = async () => {
    const cookieStore = await cookies(); // 🔥 obligatorio en Next.js 15+

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: any = {}) {
                    cookieStore.set({
                        name,
                        value,
                        ...defaultCookieOptions,
                        ...options,
                    });
                },
                remove(name: string, options: any = {}) {
                    cookieStore.set({
                        name,
                        value: '',
                        maxAge: 0,
                        ...defaultCookieOptions,
                        ...options,
                    });
                },
            },
        }
    );
};