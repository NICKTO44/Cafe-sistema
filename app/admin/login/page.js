'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../../styles/admin.css';

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (!res.ok) {
                throw new Error('Contraseña incorrecta');
            }

            router.push('/admin');
            router.refresh();
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    }

    return (
        <main className="admin-login-page">
            <form className="admin-login-card" onSubmit={handleSubmit}>
                <h1>Brew & Co.</h1>
                <p>Panel de pedidos — acceso del personal</p>
                {error && <p className="admin-error">{error}</p>}
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                />
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>
        </main>
    );
}
