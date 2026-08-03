import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';

// Un pedido se considera "activo" hasta que el admin lo marca como entregado.
export async function GET(request) {
    const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const userId = await verifySessionToken(token);

    if (!userId) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
        where: { userId, status: { not: 'entregado' } },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ order: order || null });
}