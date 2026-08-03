'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import '@/styles/admin.css';

export default function PromocionesPage() {
    const [rewards, setRewards] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    async function loadRewards() {
        const res = await fetch('/api/admin/rewards');
        const data = await res.json();
        setRewards(data.rewards || []);
        setLoading(false);
    }

    useEffect(() => {
        loadRewards();
    }, []);

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) {
            setImageFile(null);
            setImagePreview(null);
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    async function handleCreate(e) {
        e.preventDefault();
        setError('');
        if (!name.trim()) return;

        setSubmitting(true);
        try {
            let imageUrl = null;

            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                const uploadRes = await fetch('/api/admin/rewards/upload', {
                    method: 'POST',
                    body: formData,
                });

                const uploadText = await uploadRes.text();
                let uploadData;
                try {
                    uploadData = JSON.parse(uploadText);
                } catch {
                    throw new Error(
                        `El servidor respondió algo inesperado al subir la imagen (status ${uploadRes.status}): ${uploadText.slice(0, 200)}`
                    );
                }
                if (!uploadRes.ok) throw new Error(uploadData.error || 'No se pudo subir la imagen');
                imageUrl = uploadData.url;
            }

            const res = await fetch('/api/admin/rewards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, active: false, imageUrl }),
            });

            const resText = await res.text();
            let data;
            try {
                data = JSON.parse(resText);
            } catch {
                throw new Error(
                    `El servidor respondió algo inesperado al crear el postre (status ${res.status}): ${resText.slice(0, 200)}`
                );
            }
            if (!res.ok) throw new Error(data.error);

            setName('');
            setDescription('');
            setImageFile(null);
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            loadRewards();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }
    async function toggleActive(reward) {
        setError('');
        const res = await fetch(`/api/admin/rewards/${reward.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !reward.active }),
        });
        const data = await res.json();

        if (!res.ok) {
            setError(data.error);
            return;
        }
        loadRewards();
    }

    async function handleDelete(id) {
        if (!confirm('¿Eliminar este postre?')) return;
        await fetch(`/api/admin/rewards/${id}`, { method: 'DELETE' });
        loadRewards();
    }

    const activeCount = rewards.filter((r) => r.active).length;

    return (
        <main className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Promociones</h1>
                    <span className="admin-live-dot">
                        <span className="dot"></span>
                        {activeCount}/3 postres activos
                    </span>
                </div>
                <Link href="/admin" className="admin-logout-btn">
                    ← Volver a pedidos
                </Link>
            </div>

            <form onSubmit={handleCreate} className="reward-form">
                <div className="reward-form-row">
                    <input
                        className="order-status-select"
                        style={{ flex: '1 1 200px' }}
                        placeholder="Nombre del postre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        className="order-status-select"
                        style={{ flex: '2 1 300px' }}
                        placeholder="Descripción (opcional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <button className="admin-filter-btn active" type="submit" disabled={submitting}>
                        {submitting ? 'Guardando...' : 'Agregar postre'}
                    </button>
                </div>

                <div className="reward-form-row">
                    <label className="reward-image-picker">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Vista previa" className="reward-image-preview" />
                        ) : (
                            <span>+ Foto del postre</span>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            onChange={handleFileChange}
                            hidden
                        />
                    </label>
                    {imagePreview && (
                        <button
                            type="button"
                            className="admin-filter-btn"
                            onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                        >
                            Quitar foto
                        </button>
                    )}
                </div>
            </form>

            {error && <p className="admin-error">{error}</p>}

            {loading ? (
                <p className="orders-empty">Cargando...</p>
            ) : rewards.length === 0 ? (
                <p className="orders-empty">Todavía no hay postres cargados.</p>
            ) : (
                <div className="orders-grid">
                    {rewards.map((reward) => (
                        <div className="order-card" key={reward.id}>
                            {reward.imageUrl && (
                                <img src={reward.imageUrl} alt={reward.name} className="reward-card-thumb" />
                            )}
                            <div className="order-card-header">
                                <span className="order-card-customer">{reward.name}</span>
                                <span className={`status-badge ${reward.active ? 'status-listo' : 'status-entregado'}`}>
                                    {reward.active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            {reward.description && <p className="order-card-type">{reward.description}</p>}
                            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                                <button
                                    className="admin-filter-btn"
                                    style={{ flex: 1 }}
                                    onClick={() => toggleActive(reward)}
                                >
                                    {reward.active ? 'Desactivar' : 'Activar'}
                                </button>
                                <button
                                    className="admin-filter-btn"
                                    style={{ flex: 1 }}
                                    onClick={() => handleDelete(reward.id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}