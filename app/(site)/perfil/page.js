'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/customer.css';
import { useCustomer } from '@/components/CustomerProvider';
import CoffeeCupProgress from '@/components/CoffeeCupProgress';
import ProfileDoodles from '@/components/ProfileDoodles';

const POINTS_REQUIRED = 30;

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading, logout, refresh } = useCustomer();
    const [rewards, setRewards] = useState([]);
    const [redeeming, setRedeeming] = useState(null);
    const [message, setMessage] = useState('');

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        fetch('/api/rewards')
            .then((res) => res.json())
            .then((data) => setRewards(data.rewards || []));
    }, []);

    async function handleRedeem(rewardId) {
        setMessage('');
        setRedeeming(rewardId);
        try {
            const res = await fetch('/api/rewards/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rewardId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessage('Listo! Muestra esta pantalla en caja para recoger tu postre.');
            await refresh();
        } catch (err) {
            setMessage(err.message);
        } finally {
            setRedeeming(null);
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('Las contrasenas nuevas no coinciden');
            return;
        }

        setChangingPassword(true);
        try {
            const res = await fetch('/api/me/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setPasswordSuccess('Contrasena actualizada correctamente.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordError(err.message);
        } finally {
            setChangingPassword(false);
        }
    }

    async function handleLogout() {
        await logout();
        router.push('/');
    }

    if (loading || !user) {
        return (
            <main className="page profile-page">
                <p style={{ color: 'var(--muted-color)' }}>Cargando...</p>
            </main>
        );
    }

    const canRedeem = user.points >= POINTS_REQUIRED;

    return (
        <main className="page profile-page">
            <ProfileDoodles />

            <div className="profile-header">
                <span className="nickname">{user.nickname}</span>
                <span className="phone">{user.phone}</span>
            </div>

            <div className="points-card">
                <CoffeeCupProgress points={user.points} />
                <div className="points-total-label">{user.points} puntos en total</div>
            </div>

            {message && (
                <p style={{ color: 'var(--accent-color)', marginBottom: '1.5rem', textAlign: 'center' }}>{message}</p>
            )}

            <div className="rewards-grid">
                {rewards.length === 0 && (
                    <p style={{ color: 'var(--muted-color)', gridColumn: '1 / -1', textAlign: 'center' }}>
                        Todavia no hay postres disponibles para canjear.
                    </p>
                )}
                {rewards.map((reward) => (
                    <div className="reward-card" key={reward.id}>
                        {reward.imageUrl && (
                            <div className="reward-card-image">
                                <img src={reward.imageUrl} alt={reward.name} />
                            </div>
                        )}
                        <h4>{reward.name}</h4>
                        {reward.description && <p>{reward.description}</p>}
                        <button
                            className="reward-redeem-btn"
                            disabled={!canRedeem || redeeming === reward.id}
                            onClick={() => handleRedeem(reward.id)}
                        >
                            {redeeming === reward.id ? 'Canjeando...' : 'Canjear (' + POINTS_REQUIRED + ' pts)'}
                        </button>
                    </div>
                ))}
            </div>

            <button className="profile-logout" onClick={() => setShowPasswordForm((prev) => !prev)}>
                {showPasswordForm ? 'Ocultar' : 'Cambiar contrasena'}
            </button>

            {showPasswordForm && (
                <form className="review-form password-form" onSubmit={handleChangePassword}>
                    <label className="review-form-label">Cambiar contrasena</label>

                    <div className="checkout-field">
                        <label htmlFor="currentPassword">Contrasena actual</label>
                        <input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="checkout-field">
                        <label htmlFor="newPassword">Contrasena nueva</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="checkout-field">
                        <label htmlFor="confirmPassword">Repite la contrasena nueva</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {passwordError && <p className="form-error">{passwordError}</p>}
                    {passwordSuccess && <p style={{ color: 'var(--accent-color)', fontSize: '0.85rem' }}>{passwordSuccess}</p>}

                    <button className="cart-checkout-btn" type="submit" disabled={changingPassword}>
                        {changingPassword ? 'Guardando...' : 'Guardar contrasena nueva'}
                    </button>
                </form>
            )}

            <button className="profile-logout" onClick={handleLogout}>
                Cerrar sesion
            </button>
        </main>
    );
}
