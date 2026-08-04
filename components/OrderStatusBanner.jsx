'use client';

import { useEffect, useRef, useState } from 'react';
import { useCustomer } from './CustomerProvider';

const STATUS_LABELS = {
    pendiente: 'Pendiente',
    preparando: 'Preparando tu pedido',
    listo: '¡Tu pedido está listo! ',
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
                    setDismissed(false);
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
            {isReady && (
                <svg className="banner-cup-icon" viewBox="0 0 64 64" width="36" height="36">
                    <path
                        d="M14,24 L46,24 L43,48 C42,54 37,58 30,58 C23,58 18,54 17,48 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M46,28 C58,26 59,42 46,40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <path d="M22,15 C18,10 24,6 20,0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="banner-steam" />
                    <path d="M32,15 C28,10 34,6 30,0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="banner-steam" />
                </svg>
            )}
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