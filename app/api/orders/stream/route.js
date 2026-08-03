import { orderEvents } from '@/lib/orderEvents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const encoder = new TextEncoder();
    let onNewOrder;
    let onOrderUpdated;
    let onNewRedemption;
    let onRedemptionUpdated;
    let heartbeat;

    const stream = new ReadableStream({
        start(controller) {
            const send = (event, data) => {
                controller.enqueue(encoder.encode('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n'));
            };

            onNewOrder = (order) => send('new-order', order);
            onOrderUpdated = (order) => send('order-updated', order);
            onNewRedemption = (redemption) => send('new-redemption', redemption);
            onRedemptionUpdated = (redemption) => send('redemption-updated', redemption);

            orderEvents.on('new-order', onNewOrder);
            orderEvents.on('order-updated', onOrderUpdated);
            orderEvents.on('new-redemption', onNewRedemption);
            orderEvents.on('redemption-updated', onRedemptionUpdated);

            send('connected', { ok: true });

            heartbeat = setInterval(() => {
                controller.enqueue(encoder.encode(': ping\n\n'));
            }, 25000);
        },
        cancel() {
            clearInterval(heartbeat);
            orderEvents.off('new-order', onNewOrder);
            orderEvents.off('order-updated', onOrderUpdated);
            orderEvents.off('new-redemption', onNewRedemption);
            orderEvents.off('redemption-updated', onRedemptionUpdated);
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
        },
    });
}
