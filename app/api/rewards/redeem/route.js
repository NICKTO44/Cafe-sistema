import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';
import { notifyNewRedemption } from '@/lib/orderEvents';

const POINTS_REQUIRED = 30;

export async function POST(request) {
    const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const userId = await verifySessionToken(token);

    if (!userId) {
        return NextResponse.json({ error: 'Debes iniciar sesion' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const rewardId = Number(body?.rewardId);

    if (!Number.isInteger(rewardId)) {
        return NextResponse.json({ error: 'Postre invalido' }, { status: 400 });
    }

    const [user, reward] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.reward.findUnique({ where: { id: rewardId } }),
    ]);

    if (!reward || !reward.active) {
        return NextResponse.json({ error: 'Ese postre ya no esta disponible' }, { status: 404 });
    }

    if (!user || user.points < POINTS_REQUIRED) {
        return NextResponse.json({ error: 'Necesitas ' + POINTS_REQUIRED + ' puntos para canjear' }, { status: 400 });
    }

    const [updatedUser, redemption] = await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { points: { decrement: POINTS_REQUIRED } },
        }),
        prisma.redemption.create({
            data: { userId, rewardId, pointsSpent: POINTS_REQUIRED },
            include: { user: { select: { nickname: true, phone: true } }, reward: { select: { name: true } } },
        }),
    ]);

    notifyNewRedemption(redemption);

    return NextResponse.json({ points: updatedUser.points, redemption });
}
