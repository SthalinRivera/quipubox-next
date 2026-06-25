// src/proxy.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Obtener sesión
    const { data: { session } } = await supabase.auth.getSession();

    // Rutas protegidas
    const protectedPaths = [
        '/dashboard',
        '/admin',
        '/operaciones-carga',
        '/items-reparto',
        '/guias-operativas',
        '/entregas',
    ];
    const isProtected = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    // 🔥 ORIGEN REAL de la solicitud (localhost o dominio)
    const appOrigin = request.nextUrl.origin;

    // Redirigir a login si no hay sesión y la ruta es protegida
    if (isProtected && !session) {
        const redirectUrl = new URL('/signin', appOrigin);
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Si está autenticado y va a signin, enviar a dashboard
    if (session && request.nextUrl.pathname === '/signin') {
        const redirectUrl = new URL('/dashboard', appOrigin);
        return NextResponse.redirect(redirectUrl);
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/proxy).*)',
    ],
};