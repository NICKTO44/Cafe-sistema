import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const redemptions = await prisma.redemption.findMany({
            include: {
                user: { select: { nickname: true, phone: true } },
                reward: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return NextResponse.json({ redemptions });
    } catch (err) {
        console.error('[admin/redemptions GET] Error:', err);
        return NextResponse.json({ error: 'Error del servidor: ' + err.message }, { status: 500 });
    }
}
