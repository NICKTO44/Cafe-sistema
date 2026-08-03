import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, createSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';

export async function POST(request) {
    const body = await request.json().catch(() => null);
    const phone = body?.phone?.trim();
    const password = body?.password;

    if (!phone || !password) {
        return NextResponse.json({ error: 'Ingresa tu celular y contraseña' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
        return NextResponse.json({ error: 'Celular o contraseña incorrectos' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
        return NextResponse.json({ error: 'Celular o contraseña incorrectos' }, { status: 401 });
    }

    const token = await createSessionToken(user.id);
    const response = NextResponse.json({
        user: { id: user.id, phone: user.phone, nickname: user.nickname, points: user.points },
    });
    response.cookies.set(CUSTOMER_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });

    return response;
}