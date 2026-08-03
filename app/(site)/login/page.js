'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/customer.css';
import { useCustomer } from '@/components/CustomerProvider';
import { WHATSAPP_URL } from '@/lib/whatsapp';

export default function LoginPage() {
    const router = useRouter();
    const { refresh } = useCustomer();

    const [mode, setMode] = useState('login');
    const [phone, setPhone] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
        const payload = mode === 'login' ? { phone, password } : { phone, nickname, password };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Algo salio mal');

            await refresh();
            const params = new URLSearchParams(window.location.search);
            const redirectTo = params.get('next') || '/perfil';
            router.push(redirectTo);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="page auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Brew & Co.</h1>
                <p className="subtitle">
                    {mode === 'login' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta y empieza a sumar puntos'}
                </p>

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

                {mode === 'register' && (
                    <div className="auth-field">
                        <label htmlFor="nickname">Apodo</label>
                        <input
                            id="nickname"
                            type="text"
                            placeholder="Ej. Cris"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                        />
                    </div>
                )}

                <div className="auth-field">
                    <label htmlFor="password">Contrasena</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button className="auth-submit-btn" type="submit" disabled={submitting}>
                    {submitting ? 'Un momento...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
                </button>

                {mode === 'login' && (
                    <p className="auth-toggle">
                        <a href="/forgot-password">¿Olvidaste tu contrasena? Recuperala aqui</a>
                        {' - '}
                        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                            Ayuda por WhatsApp
                        </a>
                    </p>
                )}

                <p className="auth-toggle">
                    {mode === 'login' ? (
                        <>
                            No tienes cuenta?{' '}
                            <button type="button" onClick={() => setMode('register')}>
                                Registrate
                            </button>
                        </>
                    ) : (
                        <>
                            Ya tienes cuenta?{' '}
                            <button type="button" onClick={() => setMode('login')}>
                                Ingresa
                            </button>
                        </>
                    )}
                </p>
            </form>
        </main>
    );
}
