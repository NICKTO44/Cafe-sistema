import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const MAX_ACTIVE = 3;

export async function GET() {
    try {
        const rewards = await prisma.reward.findMany({ orderBy: { id: 'asc' } });
        return NextResponse.json({ rewards });
    } catch (err) {
        console.error('[rewards GET] Error:', err);
        return NextResponse.json({ error: `Error del servidor: ${err.message}` }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => null);
        const name = body?.name?.trim();
        const description = body?.description?.trim() || null;
        const imageUrl = body?.imageUrl || null;
        const active = Boolean(body?.active);

        if (!name) {
            return NextResponse.json({ error: 'Falta el nombre del postre' }, { status: 400 });
        }

        if (active) {
            const activeCount = await prisma.reward.count({ where: { active: true } });
            if (activeCount >= MAX_ACTIVE) {
                return NextResponse.json(
                    { error: `Ya hay ${MAX_ACTIVE} postres activos. Desactiva uno antes de agregar otro.` },
                    { status: 400 }
                );
            }
        }

        const reward = await prisma.reward.create({ data: { name, description, imageUrl, active } });
        return NextResponse.json({ reward }, { status: 201 });
    } catch (err) {
        console.error('[rewards POST] Error:', err);
        return NextResponse.json({ error: `Error del servidor: ${err.message}` }, { status: 500 });
    }
}