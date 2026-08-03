import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.trim();

        const users = await prisma.user.findMany({
            where: q
                ? {
                      OR: [
                          { phone: { contains: q } },
                          { nickname: { contains: q } },
                      ],
                  }
                : undefined,
            select: { id: true, phone: true, nickname: true, points: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return NextResponse.json({ users });
    } catch (err) {
        console.error('[admin/customers GET] Error:', err);
        return NextResponse.json({ error: 'Error del servidor: ' + err.message }, { status: 500 });
    }
}
