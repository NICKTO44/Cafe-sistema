'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCustomer } from './CustomerProvider';

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export default function ReviewsSection() {
    const { user, isLoggedIn, loading } = useCustomer();
    const [reviews, setReviews] = useState([]);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [loadingReviews, setLoadingReviews] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    async function loadReviews() {
        try {
            const res = await fetch('/api/reviews');
            const data = await res.json();
            setReviews(data.reviews || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingReviews(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!comment.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setReviews((prev) => [data.review, ...prev]);
            setComment('');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

   
    const MIN_FOR_LOOP = 4;
    const hasEnoughForLoop = reviews.length >= MIN_FOR_LOOP;
    const trackReviews = hasEnoughForLoop ? [...reviews, ...reviews] : reviews;

    return (
        <main className="page resenas-page">
            <div className="page-heading">
                <span className="eyebrow">BREW & CO.</span>
                <h1>Lo Que Dicen</h1>
            </div>

            <div className="review-form-wrapper">
                {loading ? null : isLoggedIn ? (
                    <form className="review-form" onSubmit={handleSubmit}>
                        <label htmlFor="review-comment" className="review-form-label">
                            Cuéntanos tu experiencia, {user.nickname}
                        </label>
                        <textarea
                            id="review-comment"
                            className="review-textarea"
                            placeholder="¿Qué te pareció el servicio?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={500}
                            rows={3}
                        />
                        {error && <p className="form-error">{error}</p>}
                        <button className="cart-checkout-btn" type="submit" disabled={submitting || !comment.trim()}>
                            {submitting ? 'Publicando...' : 'Publicar reseña'}
                        </button>
                    </form>
                ) : (
                    <div className="review-login-cta">
                        <p>Inicia sesión para dejar tu reseña.</p>
                        <Link href="/login?next=/resenas" className="cart-checkout-btn" style={{ display: 'inline-block' }}>
                            Iniciar sesión
                        </Link>
                    </div>
                )}
            </div>

            <div className="reviews-carousel">
                {loadingReviews ? (
                    <p className="orders-empty">Cargando reseñas...</p>
                ) : reviews.length === 0 ? (
                    <p className="orders-empty"></p>
                ) : (
                    <div className={`reviews-track ${hasEnoughForLoop ? '' : 'reviews-track--static'}`}>
                        {trackReviews.map((review, i) => (
                            <div className="review-card" key={`${review.id}-${i}`}>
                                <span className="review-quote">“</span>
                                <p className="review-comment">{review.comment}</p>
                                <div className="review-footer">
                                    <span className="review-author">{review.user.nickname}</span>
                                    <span className="review-date">{formatDate(review.createdAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}