import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from './lib/auth';
import { verifySessionToken, CUSTOMER_COOKIE_NAME } from './lib/customerAuth';

const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/api/admin/login', '/api/admin/logout']);

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Login/logout del admin siempre accesibles
    if (PUBLIC_ADMIN_PATHS.has(pathname)) {
        return NextResponse.next();
    }

    // --- Zona admin: panel + API de pedidos + API de promociones ---
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/orders') || pathname.startsWith('/api/admin')) {
        const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
        const expected = process.env.SESSION_SECRET;
        const isAdmin = session && expected && session === expected;

        if (!isAdmin) {
            // POST /api/orders es del cliente (verifica su propia sesión dentro de la ruta)
            if (pathname === '/api/orders' && request.method === 'POST') {
                return NextResponse.next();
            }
            if (pathname.startsWith('/admin')) {
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.next();
    }

    // --- Zona cliente: perfil requiere sesión de cliente ---
    if (pathname.startsWith('/perfil')) {
        const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
        const userId = await verifySessionToken(token);

        if (!userId) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/orders/:path*', '/api/admin/:path*', '/perfil/:path*'],
};