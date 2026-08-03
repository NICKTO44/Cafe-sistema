import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';

export async function POST(request) {
    const body = await request.json().catch(() => null);
    const phone = body?.phone?.trim();
    const nickname = body?.nickname?.trim();
    const password = body?.password;

    if (!phone || !nickname || !password) {
        return NextResponse.json({ error: 'Faltan datos (celular, apodo o contraseña)' }, { status: 400 });
    }
    if (password.length < 4) {
        return NextResponse.json({ error: 'La contraseña debe tener al menos 4 caracteres' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
        return NextResponse.json({ error: 'Ese número de celular ya está registrado' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
        data: { phone, nickname, passwordHash },
    });

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