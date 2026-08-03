'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '@/styles/admin.css';

export default function ClientesPage() {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(null);
    const [resultFor, setResultFor] = useState(null);
    const [error, setError] = useState('');

    async function loadUsers(q = '') {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/customers?q=' + encodeURIComponent(q));
            const data = await res.json();
            setUsers(data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    function handleSearch(e) {
        e.preventDefault();
        loadUsers(query);
    }

    async function handleReset(userId) {
        if (!confirm('Generar una contrasena nueva para este cliente? La anterior dejara de funcionar.')) return;

        setError('');
        setResetting(userId);
        setResultFor(null);

        try {
            const res = await fetch('/api/admin/customers/' + userId + '/reset-password', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setResultFor({ userId: userId, password: data.newPassword });
        } catch (err) {
            setError(err.message);
        } finally {
            setResetting(null);
        }
    }

    return (
        <main className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Clientes</h1>
                    <span className="admin-live-dot">
                        <span className="dot"></span>
                        {users.length} resultados
                    </span>
                </div>
                <Link href="/admin" className="admin-logout-btn">
                    Volver a pedidos
                </Link>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem' }}>
                <input
                    className="order-status-select"
                    style={{ flex: 1 }}
                    placeholder="Buscar por celular o apodo..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button className="admin-filter-btn active" type="submit">
                    Buscar
                </button>
            </form>

            {error && <p className="admin-error">{error}</p>}

            {loading ? (
                <p className="orders-empty">Cargando...</p>
            ) : users.length === 0 ? (
                <p className="orders-empty">No se encontraron clientes.</p>
            ) : (
                <div className="orders-grid">
                    {users.map((user) => (
                        <div className="order-card" key={user.id}>
                            <div className="order-card-header">
                                <span className="order-card-customer">{user.nickname}</span>
                                <span className="order-card-meta">{user.points} pts</span>
                            </div>
                            <p className="order-card-type">{user.phone}</p>

                            {resultFor && resultFor.userId === user.id ? (
                                <div className="reset-password-result">
                                    <p>Nueva contrasena:</p>
                                    <div className="reset-password-value">{resultFor.password}</div>
                                    <p className="reset-password-hint">
                                        Comparte esto con el cliente por WhatsApp - no se guarda en ningun lado, si la
                                        pierdes tendras que generar otra.
                                    </p>
                                </div>
                            ) : (
                                <button
                                    className="admin-filter-btn"
                                    style={{ marginTop: '1rem', width: '100%' }}
                                    onClick={() => handleReset(user.id)}
                                    disabled={resetting === user.id}
                                >
                                    {resetting === user.id ? 'Generando...' : 'Resetear contrasena'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
