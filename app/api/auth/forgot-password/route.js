import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/customerAuth';

const GENERIC_ERROR = 'No encontramos una cuenta con esos datos. Revisa el celular y el apodo.';

export async function POST(request) {
    try {
        const body = await request.json().catch(() => null);
        const phone = body?.phone?.trim();
        const nickname = body?.nickname?.trim();
        const newPassword = body?.newPassword;

        if (!phone || !nickname || !newPassword) {
            return NextResponse.json({ error: 'Completa todos los campos' }, { status: 400 });
        }
        if (newPassword.length < 4) {
            return NextResponse.json({ error: 'La contrasena nueva debe tener al menos 4 caracteres' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { phone } });

        if (!user || user.nickname.toLowerCase() !== nickname.toLowerCase()) {
            return NextResponse.json({ error: GENERIC_ERROR }, { status: 404 });
        }

        const newHash = await hashPassword(newPassword);
        await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[auth/forgot-password] Error:', err);
        return NextResponse.json({ error: 'Error del servidor: ' + err.message }, { status: 500 });
    }
}
