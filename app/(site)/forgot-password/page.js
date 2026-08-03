'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/customer.css';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [nickname, setNickname] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contrasenas no coinciden');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, nickname, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (success) {
        return (
            <main className="page auth-page">
                <div className="auth-card">
                    <h1>Listo</h1>
                    <p className="subtitle">Tu contrasena fue actualizada. Ya puedes iniciar sesion con la nueva.</p>
                    <button className="auth-submit-btn" onClick={() => router.push('/login')}>
                        Ir a iniciar sesion
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="page auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Recuperar cuenta</h1>
                <p className="subtitle">Ingresa tu celular y tu apodo tal como los registraste</p>

                {error && <p className="form-error">{error}</p>}

                <div className="auth-field">
                    <label htmlFor="phone">Celular</label>
                    <input
                        id="phone"
                        type="tel"
                        placeholder="Ej. 987654321"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="nickname">Apodo</label>
                    <input
                        id="nickname"
                        type="text"
                        placeholder="Como te registraste"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="newPassword">Contrasena nueva</label>
                    <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="confirmPassword">Repite la contrasena nueva</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button className="auth-submit-btn" type="submit" disabled={submitting}>
                    {submitting ? 'Un momento...' : 'Cambiar contrasena'}
                </button>

                <p className="auth-toggle">
                    <a href="/login">Volver a iniciar sesion</a>
                </p>
            </form>
        </main>
    );
}
