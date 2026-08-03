'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import { useCurrency } from './CurrencyProvider';
import { useCustomer } from './CustomerProvider';

export default function CartDrawer() {
    const router = useRouter();
    const { items, isOpen, setIsOpen, updateQty, totalUsd, clearCart } = useCart();
    const { currency, rate, format } = useCurrency();
    const { user, isLoggedIn } = useCustomer();

    const [step, setStep] = useState('cart'); // cart | checkout | success
    const [customerName, setCustomerName] = useState('');
    const [orderType, setOrderType] = useState('mesa');
    const [tableNumber, setTableNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [orderId, setOrderId] = useState(null);
    const [lastCustomerName, setLastCustomerName] = useState('');

    function close() {
        setIsOpen(false);
        setTimeout(() => {
            if (step === 'success') {
                setStep('cart');
                setCustomerName('');
                setTableNumber('');
                setOrderType('mesa');
            }
        }, 400);
    }

    function goToCheckout() {
        if (!isLoggedIn) {
            setIsOpen(false);
            router.push('/login?next=/menu');
            return;
        }
        setCustomerName((prev) => prev || user?.nickname || '');
        setStep('checkout');
    }

    async function submitOrder(e) {
        e.preventDefault();
        setError('');

        if (!customerName.trim()) {
            setError('Ingresa tu nombre');
            return;
        }
        if (orderType === 'mesa' && !tableNumber.trim()) {
            setError('Ingresa el número de mesa');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName,
                    orderType,
                    tableNumber: orderType === 'mesa' ? tableNumber : null,
                    currency,
                    exchangeRate: currency === 'PEN' ? rate : null,
                    items: items.map((i) => ({ name: i.name, priceUsd: i.priceUsd, quantity: i.quantity })),
                }),
            });

            if (res.status === 401) {
                throw new Error('Tu sesión expiró, vuelve a iniciar sesión');
            }
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'No se pudo enviar el pedido');
            }

            const data = await res.json();
            setOrderId(data.order.id);
            setLastCustomerName(customerName);
            clearCart();
            setStep('success');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={close} />
            <aside className={`cart-drawer ${isOpen ? 'open' : ''}`}>
                <div className="cart-drawer-header">
                    <h2>{step === 'success' ? 'Pedido enviado' : 'Tu carrito'}</h2>
                    <button className="cart-close-btn" onClick={close} aria-label="Cerrar carrito">
                        ✕
                    </button>
                </div>

                {step === 'cart' && (
                    <>
                        {items.length === 0 ? (
                            <p className="cart-empty">
                                Tu carrito está vacío. Ve al Menú y agrega algo delicioso ☕
                            </p>
                        ) : (
                            <>
                                <div className="cart-items">
                                    {items.map((item) => (
                                        <div className="cart-item" key={item.name}>
                                            <div className="cart-item-info">
                                                <span className="cart-item-name">{item.name}</span>
                                                <span className="cart-item-price">{format(item.priceUsd)} c/u</span>
                                            </div>
                                            <div className="cart-item-qty">
                                                <button className="qty-btn" onClick={() => updateQty(item.name, -1)}>
                                                    −
                                                </button>
                                                <span className="qty-value">{item.quantity}</span>
                                                <button className="qty-btn" onClick={() => updateQty(item.name, 1)}>
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="cart-summary">
                                    <div className="cart-total-row">
                                        <span>Total</span>
                                        <span>{format(totalUsd)}</span>
                                    </div>
                                    {!isLoggedIn && (
                                        <p className="form-error" style={{ color: 'var(--muted-color)' }}>
                                            Necesitas iniciar sesión para completar el pedido.
                                        </p>
                                    )}
                                    <button className="cart-checkout-btn" onClick={goToCheckout}>
                                        {isLoggedIn ? 'Continuar' : 'Iniciar sesión para continuar'}
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}

                {step === 'checkout' && (
                    <form className="checkout-form" onSubmit={submitOrder}>
                        <button type="button" className="checkout-back-btn" onClick={() => setStep('cart')}>
                            ← Volver al carrito
                        </button>

                        <div className="checkout-field">
                            <label htmlFor="customerName">Tu nombre</label>
                            <input
                                id="customerName"
                                type="text"
                                placeholder="Ej. Cristhian"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>

                        <div className="checkout-field">
                            <label>Tipo de pedido</label>
                            <div className="checkout-type-toggle">
                                <button
                                    type="button"
                                    className={`checkout-type-btn ${orderType === 'mesa' ? 'active' : ''}`}
                                    onClick={() => setOrderType('mesa')}
                                >
                                    En mesa
                                </button>
                                <button
                                    type="button"
                                    className={`checkout-type-btn ${orderType === 'llevar' ? 'active' : ''}`}
                                    onClick={() => setOrderType('llevar')}
                                >
                                    Para llevar
                                </button>
                            </div>
                        </div>

                        {orderType === 'mesa' && (
                            <div className="checkout-field">
                                <label htmlFor="tableNumber">Número de mesa</label>
                                <input
                                    id="tableNumber"
                                    type="text"
                                    placeholder="Ej. 5"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="cart-summary" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
                            <div className="cart-total-row">
                                <span>Total</span>
                                <span>{format(totalUsd)}</span>
                            </div>
                            {error && <p className="form-error">{error}</p>}
                            <button className="cart-checkout-btn" type="submit" disabled={submitting}>
                                {submitting ? 'Enviando...' : 'Confirmar pedido'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 'success' && (
                    <div className="checkout-success">
                        <p>¡Gracias, {lastCustomerName}!</p>
                        <div className="order-number">#{orderId}</div>
                        <p>Tu pedido fue enviado a cocina. Te avisaremos cuando esté listo.</p>
                    </div>
                )}
            </aside>
        </>
    );
}