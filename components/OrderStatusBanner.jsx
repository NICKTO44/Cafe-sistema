'use client';

import { useEffect, useRef, useState } from 'react';
import { useCustomer } from './CustomerProvider';

const STATUS_LABELS = {
    pendiente: 'Pendiente',
    preparando: 'Preparando tu pedido',
    listo: '¡Tu pedido está listo! 🎉',
    entregado: 'Entregado',
};

const POLL_INTERVAL = 5000;

export default function OrderStatusBanner() {
    const { isLoggedIn } = useCustomer();
    const [order, setOrder] = useState(null);
    const [dismissed, setDismissed] = useState(false);
    const intervalRef = useRef(null);
    const prevStatusRef = useRef(null);

    useEffect(() => {
        if (!isLoggedIn) {
            setOrder(null);
            return;
        }

        async function poll() {
            try {
                const res = await fetch('/api/me/active-order');
                if (!res.ok) return;
                const data = await res.json();

                if (data.order && data.order.status !== prevStatusRef.current) {
                    setDismissed(false); // un cambio de estado vuelve a mostrar el banner si lo habían cerrado
                }
                prevStatusRef.current = data.order?.status ?? null;
                setOrder(data.order);
            } catch (e) {
                // silencioso: si falla una consulta, se reintenta en el próximo ciclo
            }
        }

        poll();
        intervalRef.current = setInterval(poll, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [isLoggedIn]);

    if (!isLoggedIn || !order || dismissed) return null;

    const isReady = order.status === 'listo';

    return (
        <div className={`order-status-banner ${isReady ? 'ready' : ''}`}>
            <div className="order-status-banner-text">
                <span className="order-status-banner-order">Pedido #{order.id}</span>
                <span className="order-status-banner-label">{STATUS_LABELS[order.status]}</span>
            </div>
            <button
                className="order-status-banner-close"
                onClick={() => setDismissed(true)}
                aria-label="Ocultar aviso"
            >
                ✕
            </button>
        </div>
    );
}