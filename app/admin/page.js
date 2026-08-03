'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/admin.css';

const STATUS_LABELS = {
    pendiente: 'Pendiente',
    preparando: 'Preparando',
    listo: 'Listo',
    entregado: 'Entregado',
};

const FILTERS = ['todos', 'pendiente', 'preparando', 'listo', 'entregado'];

function formatOrderTime(iso) {
    const date = new Date(iso);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function formatOrderTotal(order) {
    if (order.currency === 'PEN' && order.exchangeRate) {
        return `S/ ${(order.totalUsd * order.exchangeRate).toFixed(2)}`;
    }
    return `$${order.totalUsd.toFixed(2)}`;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('todos');
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        fetch('/api/orders')
            .then((res) => {
                if (res.status === 401) {
                    router.push('/admin/login');
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (data) setOrders(data.orders);
            })
            .catch((err) => console.error('No se pudieron cargar los pedidos:', err))
            .finally(() => setLoading(false));
    }, [router]);

    useEffect(() => {
        const es = new EventSource('/api/orders/stream');
        eventSourceRef.current = es;

        es.addEventListener('connected', () => setConnected(true));

        es.addEventListener('new-order', (event) => {
            const order = JSON.parse(event.data);
            setOrders((prev) => [order, ...prev]);
        });

        es.addEventListener('order-updated', (event) => {
            const updated = JSON.parse(event.data);
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        });

        es.onerror = () => {
            setConnected(false);
        };

        return () => {
            es.close();
        };
    }, []);

    async function updateStatus(orderId, status) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('No se pudo actualizar el estado');
        } catch (err) {
            console.error(err);
        }
    }

    async function handleLogout() {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
    }

    const filteredOrders = filter === 'todos' ? orders : orders.filter((o) => o.status === filter);

    return (
        <main className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Pedidos</h1>
                    <span className={`admin-live-dot ${connected ? '' : 'disconnected'}`}>
                        <span className="dot"></span>
                        {connected ? 'En vivo' : 'Reconectando...'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <Link href="/admin/clientes" className="admin-logout-btn">
                        Clientes
                    </Link>
                    <Link href="/admin/promociones" className="admin-logout-btn">
                        Promociones
                    </Link>
                    <Link href="/admin/qr" className="admin-logout-btn">
                        QR
                    </Link>
                    <Link href="/admin/canjes" className="admin-logout-btn">
                        Canjes
                    </Link>
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        Cerrar sesión
                    </button>
                </div>
            </div>

            <div className="admin-filters">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        className={`admin-filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'todos' ? 'Todos' : STATUS_LABELS[f]}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="orders-empty">Cargando pedidos...</p>
            ) : filteredOrders.length === 0 ? (
                <p className="orders-empty">No hay pedidos {filter !== 'todos' ? `en estado "${STATUS_LABELS[filter]}"` : 'todavía'}.</p>
            ) : (
                <div className="orders-grid">
                    {filteredOrders.map((order) => (
                        <div className="order-card" key={order.id}>
                            <div className="order-card-header">
                                <span className="order-card-id">#{order.id}</span>
                                <span className="order-card-meta">
                                    {formatOrderTime(order.createdAt)}
                                    <br />
                                    <span className={`status-badge status-${order.status}`}>
                                        {STATUS_LABELS[order.status]}
                                    </span>
                                </span>
                            </div>

                            <div className="order-card-customer">{order.customerName}</div>
                            <div className="order-card-type">
                                {order.orderType === 'mesa' ? `Mesa ${order.tableNumber}` : 'Para llevar'}
                            </div>

                            <ul className="order-card-items">
                                {order.items.map((item) => (
                                    <li key={item.id}>
                                        <span>
                                            {item.quantity}× {item.name}
                                        </span>
                                        <span>${(item.priceUsd * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="order-card-total">
                                <span>Total</span>
                                <span>{formatOrderTotal(order)}</span>
                            </div>

                            <select
                                className="order-status-select"
                                value={order.status}
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                            >
                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}