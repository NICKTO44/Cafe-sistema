import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';

const MAX_COMMENT_LENGTH = 500;

export async function GET() {
    try {
        const reviews = await prisma.review.findMany({
            include: { user: { select: { nickname: true } } },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
        return NextResponse.json({ reviews });
    } catch (err) {
        console.error('[reviews GET] Error:', err);
        return NextResponse.json({ error: `Error del servidor: ${err.message}` }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
        const userId = await verifySessionToken(token);

        if (!userId) {
            return NextResponse.json({ error: 'Debes iniciar sesión para dejar una reseña' }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const comment = body?.comment?.trim();

        if (!comment) {
            return NextResponse.json({ error: 'Escribe algo antes de publicar' }, { status: 400 });
        }
        if (comment.length > MAX_COMMENT_LENGTH) {
            return NextResponse.json(
                { error: `La reseña es demasiado larga (máx. ${MAX_COMMENT_LENGTH} caracteres)` },
                { status: 400 }
            );
        }

        const review = await prisma.review.create({
            data: { userId, comment },
            include: { user: { select: { nickname: true } } },
        });

        return NextResponse.json({ review }, { status: 201 });
    } catch (err) {
        console.error('[reviews POST] Error:', err);
        return NextResponse.json({ error: `Error del servidor: ${err.message}` }, { status: 500 });
    }
}