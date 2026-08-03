import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyOrderUpdated } from '@/lib/orderEvents';

const VALID_STATUSES = ['pendiente', 'preparando', 'listo', 'entregado'];
const USD_PER_POINT = 2; // 1 punto por cada $2 consumidos

// PATCH /api/orders/:id — el panel admin cambia el estado de un pedido
export async function PATCH(request, context) {
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isInteger(id)) {
        return NextResponse.json({ error: 'ID de pedido inválido' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const status = body?.status;

    if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Sumar puntos solo la primera vez que el pedido llega a "entregado"
    const shouldAwardPoints = status === 'entregado' && !existing.pointsAwarded;
    const pointsToAward = shouldAwardPoints ? Math.floor(existing.totalUsd / USD_PER_POINT) : 0;

    const [order] = await prisma.$transaction([
        prisma.order.update({
            where: { id },
            data: {
                status,
                pointsAwarded: shouldAwardPoints ? true : existing.pointsAwarded,
            },
            include: { items: true },
        }),
        ...(shouldAwardPoints
            ? [
                  prisma.user.update({
                      where: { id: existing.userId },
                      data: { points: { increment: pointsToAward } },
                  }),
              ]
            : []),
    ]);

    notifyOrderUpdated(order);

    return NextResponse.json({ order, pointsAwarded: pointsToAward });
}