// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleRoutes: Record<string, string> = {
    'encargado_carga': '/dashboard/operaciones-carga/nueva',
    'repartidor': '/dashboard/guias-operativas',
    'encargado_retorno': '/dashboard/jabas-cobrar',
    'chofer': '/dashboard/mis-rutas',
    'estibador': '/dashboard/cargas-activas',
    // admin y supervisor no tienen ruta específica
};

export function middleware(request: NextRequest) {
    const userRole = request.cookies.get('user-role')?.value;
    const pathname = request.nextUrl.pathname;

    // Solo actuar si el usuario va a /dashboard
    if (pathname === '/dashboard' && userRole && roleRoutes[userRole]) {
        return NextResponse.redirect(new URL(roleRoutes[userRole], request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/dashboard', // solo aplica a /dashboard
};