import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, isValidAdminPassword, getExpectedSessionValue } from '@/lib/auth';

export async function POST(request) {
    const body = await request.json().catch(() => null);
    const password = body?.password;

    if (!password || !isValidAdminPassword(password)) {
        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, getExpectedSessionValue(), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 12, // 12 horas
    });

    return response;
}
