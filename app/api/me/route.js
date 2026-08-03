import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';

export async function GET(request) {
    const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const userId = await verifySessionToken(token);

    if (!userId) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, phone: true, nickname: true, points: true },
    });

    if (!user) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    return NextResponse.json({ user });
}