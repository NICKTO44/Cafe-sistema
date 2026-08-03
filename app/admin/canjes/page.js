'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/admin.css';

function formatTime(iso) {
    return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

export default function CanjesPage() {
    const router = useRouter();
    const [redemptions, setRedemptions] = useState([]);
    const [filter, setFilter] = useState('pendientes');
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        fetch('/api/admin/redemptions')
            .then((res) => {
                if (res.status === 401) {
                    router.push('/admin/login');
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (data) setRedemptions(data.redemptions);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [router]);

    useEffect(() => {
        const es = new EventSource('/api/orders/stream');
        eventSourceRef.current = es;

        es.addEventListener('connected', () => setConnected(true));

        es.addEventListener('new-redemption', (event) => {
            const redemption = JSON.parse(event.data);
            setRedemptions((prev) => [redemption, ...prev]);
        });

        es.addEventListener('redemption-updated', (event) => {
            const updated = JSON.parse(event.data);
            setRedemptions((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        });

        es.onerror = () => setConnected(false);

        return () => es.close();
    }, []);

    async function toggleFulfilled(redemption) {
        setRedemptions((prev) =>
            prev.map((r) => (r.id === redemption.id ? { ...r, fulfilled: !r.fulfilled } : r))
        );

        try {
            await fetch('/api/admin/redemptions/' + redemption.id, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fulfilled: !redemption.fulfilled }),
            });
        } catch (err) {
            console.error(err);
        }
    }

    const visible = filter === 'pendientes' ? redemptions.filter((r) => !r.fulfilled) : redemptions;

    return (
        <main className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Canjes</h1>
                    <span className={'admin-live-dot ' + (connected ? '' : 'disconnected')}>
                        <span className="dot"></span>
                        {connected ? 'En vivo' : 'Reconectando...'}
                    </span>
                </div>
                <Link href="/admin" className="admin-logout-btn">
                    Volver a pedidos
                </Link>
            </div>

            <div className="admin-filters">
                <button
                    className={'admin-filter-btn ' + (filter === 'pendientes' ? 'active' : '')}
                    onClick={() => setFilter('pendientes')}
                >
                    Pendientes
                </button>
                <button
                    className={'admin-filter-btn ' + (filter === 'todos' ? 'active' : '')}
                    onClick={() => setFilter('todos')}
                >
                    Todos
                </button>
            </div>

            {loading ? (
                <p className="orders-empty">Cargando...</p>
            ) : visible.length === 0 ? (
                <p className="orders-empty">
                    {filter === 'pendientes' ? 'No hay canjes pendientes por entregar.' : 'Todavia no hay canjes.'}
                </p>
            ) : (
                <div className="orders-grid">
                    {visible.map((r) => (
                        <div className="order-card" key={r.id}>
                            <div className="order-card-header">
                                <span className="order-card-id">#{r.id}</span>
                                <span className="order-card-meta">
                                    {formatTime(r.createdAt)}
                                    <br />
                                    <span className={'status-badge ' + (r.fulfilled ? 'status-entregado' : 'status-pendiente')}>
                                        {r.fulfilled ? 'Entregado' : 'Pendiente'}
                                    </span>
                                </span>
                            </div>

                            <div className="order-card-customer">{r.user.nickname}</div>
                            <div className="order-card-type">{r.user.phone}</div>

                            <div className="order-card-total">
                                <span>{r.reward.name}</span>
                                <span>{r.pointsSpent} pts</span>
                            </div>

                            <button
                                className="admin-filter-btn"
                                style={{ width: '100%' }}
                                onClick={() => toggleFulfilled(r)}
                            >
                                {r.fulfilled ? 'Marcar como pendiente' : 'Marcar como entregado'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
