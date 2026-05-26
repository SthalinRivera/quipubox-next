import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Permitir el callback de autenticación
    if (req.nextUrl.pathname === '/auth/callback') {
        return NextResponse.next();
    }

    const protectedPaths = ['/dashboard', '/admin']; // Ajusta según tu app
    const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

    if (isProtected && !session) {
        const redirectUrl = new URL('/signin', req.url);
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};