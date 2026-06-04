// src/proxy.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Obtener sesión (esto también refrescará tokens automáticamente)
    const { data: { session } } = await supabase.auth.getSession()

    // Rutas protegidas
    const protectedPaths = ['/dashboard', '/admin', '/operaciones-carga', '/items-reparto', '/guias-operativas', '/entregas']
    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

    // Redirigir a login si no hay sesión y la ruta es protegida
    if (isProtected && !session) {
        const redirectUrl = new URL('/signin', request.url)
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Si está autenticado y va a signin, enviar a dashboard
    if (session && request.nextUrl.pathname === '/signin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

// Configurar el matcher para que el proxy se ejecute en las rutas necesarias
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon)
         * - api/proxy (el propio proxy no debe interceptarse)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/proxy).*)',
    ],
}