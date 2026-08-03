import { EventEmitter } from 'events';

const globalForEvents = global;

export const orderEvents =
    globalForEvents.orderEvents || new EventEmitter();

orderEvents.setMaxListeners(50);

if (process.env.NODE_ENV !== 'production') {
    globalForEvents.orderEvents = orderEvents;
}

export function notifyNewOrder(order) {
    orderEvents.emit('new-order', order);
}

export function notifyOrderUpdated(order) {
    orderEvents.emit('order-updated', order);
}

export function notifyNewRedemption(redemption) {
    orderEvents.emit('new-redemption', redemption);
}

export function notifyRedemptionUpdated(redemption) {
    orderEvents.emit('redemption-updated', redemption);
}
