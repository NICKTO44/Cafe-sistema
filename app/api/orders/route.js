import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyNewOrder } from '@/lib/orderEvents';
import { verifySessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';

// GET /api/orders — lista de pedidos para el panel admin (protegido por middleware)
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const orders = await prisma.order.findMany({
        where: status ? { status } : undefined,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
}

// POST /api/orders — el cliente confirma su pedido desde el carrito (requiere sesión de cliente)
export async function POST(request) {
    const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const userId = await verifySessionToken(token);

    if (!userId) {
        return NextResponse.json({ error: 'Debes iniciar sesión para pedir' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 });
    }

    const { customerName, orderType, tableNumber, currency, exchangeRate, items } = body;

    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
        return NextResponse.json({ error: 'Falta el nombre del cliente' }, { status: 400 });
    }

    if (orderType !== 'mesa' && orderType !== 'llevar') {
        return NextResponse.json({ error: 'orderType debe ser "mesa" o "llevar"' }, { status: 400 });
    }

    if (orderType === 'mesa' && (!tableNumber || !String(tableNumber).trim())) {
        return NextResponse.json({ error: 'Falta el número de mesa' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    for (const item of items) {
        if (!item.name || typeof item.priceUsd !== 'number' || typeof item.quantity !== 'number' || item.quantity < 1) {
            return NextResponse.json({ error: 'Ítem de pedido inválido' }, { status: 400 });
        }
    }

    const totalUsd = items.reduce((sum, item) => sum + item.priceUsd * item.quantity, 0);

    const order = await prisma.order.create({
        data: {
            userId,
            customerName: customerName.trim(),
            orderType,
            tableNumber: orderType === 'mesa' ? String(tableNumber).trim() : null,
            currency: currency === 'PEN' ? 'PEN' : 'USD',
            exchangeRate: currency === 'PEN' ? exchangeRate ?? null : null,
            totalUsd,
            status: 'pendiente',
            items: {
                create: items.map((item) => ({
                    name: item.name,
                    priceUsd: item.priceUsd,
                    quantity: item.quantity,
                })),
            },
        },
        include: { items: true },
    });

    notifyNewOrder(order);

    return NextResponse.json({ order }, { status: 201 });
}