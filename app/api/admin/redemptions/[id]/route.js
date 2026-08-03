import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyRedemptionUpdated } from '@/lib/orderEvents';

export async function PATCH(request, context) {
    try {
        const { id: rawId } = await context.params;
        const id = Number(rawId);
        if (!Number.isInteger(id)) {
            return NextResponse.json({ error: 'ID invalido' }, { status: 400 });
        }

        const body = await request.json().catch(() => null);
        const fulfilled = Boolean(body?.fulfilled);

        const redemption = await prisma.redemption.update({
            where: { id },
            data: { fulfilled },
            include: {
                user: { select: { nickname: true, phone: true } },
                reward: { select: { name: true } },
            },
        });

        notifyRedemptionUpdated(redemption);

        return NextResponse.json({ redemption });
    } catch (err) {
        console.error('[admin/redemptions PATCH] Error:', err);
        return NextResponse.json({ error: 'Error del servidor: ' + err.message }, { status: 500 });
    }
}
