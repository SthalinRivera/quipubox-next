import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    // 🔥 Usamos la variable de entorno, con fallback a localhost
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!code) {
        return NextResponse.redirect(new URL('/signin?error=missing_code', appUrl));
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(new URL('/signin?error=auth_failed', appUrl));
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
        return NextResponse.redirect(new URL('/signin?error=no_token', appUrl));
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

    try {
        const profileRes = await fetch(`${apiBase}/auth/profile`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (profileRes.ok) {
            return NextResponse.redirect(new URL('/dashboard', appUrl));
        } else {
            await supabase.auth.signOut();
            let errorMessage = 'Tu cuenta está bloqueada. Contacta al administrador.';
            try {
                const errData = await profileRes.json();
                errorMessage = errData.message || errorMessage;
            } catch { }
            return NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent(errorMessage)}`, appUrl));
        }
    } catch {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/signin?error=server_error', appUrl));
    }
}