import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    const rewards = await prisma.reward.findMany({
        where: { active: true },
        orderBy: { id: 'asc' },
    });
    return NextResponse.json({ rewards });
}