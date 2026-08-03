import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const MAX_ACTIVE = 3;

export async function PATCH(request, context) {
    try {
        const { id: rawId } = await context.params;
        const id = Number(rawId);
        if (!Number.isInteger(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        const body = await request.json().catch(() => null);
        const data = {};

        if (typeof body?.name === 'string') data.name = body.name.trim();
        if (typeof body?.description === 'string') data.description = body.description.trim();
        if (typeof body?.imageUrl === 'string' || body?.imageUrl === null) data.imageUrl = body.imageUrl;

        if (typeof body?.active === 'boolean') {
            if (body.active) {
                const activeCount = await prisma.reward.count({ where: { active: true, id: { not: id } } });
                if (activeCount >= MAX_ACTIVE) {
                    return NextResponse.json(
                        { error: `Ya hay ${MAX_ACTIVE} postres activos. Desactiva uno antes de activar este.` },
                        { status: 400 }
                    );
                }
            }
            data.active = body.active;
        }

        const reward = await prisma.reward.update({ where: { id }, data });
        return NextResponse.json({ reward });
    } catch (err) {
        console.error('[rewards PATCH] Error:', err);
        return NextResponse.json({ error: `Error del servidor: ${err.message}` }, { status: 500 });
    }
}

export async function DELETE(request, context) {
    try {
        const { id: rawId } = await context.params;
        const id = Number(rawId);
        if (!Number.isInteger(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        await prisma.reward.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[rewards DELETE] Error:', err);
        return NextResponse.json({ error: `Error del servidor: ${err.message}` }, { status: 500 });
    }
}