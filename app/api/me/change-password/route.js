import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, hashPassword, verifySessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';

export async function POST(request) {
    try {
        const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
        const userId = await verifySessionToken(token);

        if (!userId) {
            return NextResponse.json({ error: 'Debes iniciar sesion' }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const currentPassword = body?.currentPassword;
        const newPassword = body?.newPassword;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Completa ambos campos' }, { status: 400 });
        }
        if (newPassword.length < 4) {
            return NextResponse.json({ error: 'La contrasena nueva debe tener al menos 4 caracteres' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: 'Debes iniciar sesion' }, { status: 401 });
        }

        const isValid = await verifyPassword(currentPassword, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Tu contrasena actual no es correcta' }, { status: 401 });
        }

        const newHash = await hashPassword(newPassword);
        await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[me/change-password] Error:', err);
        return NextResponse.json({ error: 'Error del servidor: ' + err.message }, { status: 500 });
    }
}
