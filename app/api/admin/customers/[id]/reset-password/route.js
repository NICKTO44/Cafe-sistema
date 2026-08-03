import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/customerAuth';

const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

function generateTempPassword(length = 8) {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join('');
}

export async function POST(request, context) {
    try {
        const { id: rawId } = await context.params;
        const id = Number(rawId);
        if (!Number.isInteger(id)) {
            return NextResponse.json({ error: 'ID invalido' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        const newPassword = generateTempPassword();
        const passwordHash = await hashPassword(newPassword);

        await prisma.user.update({ where: { id }, data: { passwordHash } });

        return NextResponse.json({ newPassword });
    } catch (err) {
        console.error('[admin/customers reset-password] Error:', err);
        return NextResponse.json({ error: 'Error del servidor: ' + err.message }, { status: 500 });
    }
}
