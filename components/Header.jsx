'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import { useCustomer } from './CustomerProvider';
import { WHATSAPP_URL } from '@/lib/whatsapp';

const NAV_ITEMS = [
    { href: '/', label: 'Inicio' },
    { href: '/menu', label: 'Menu' },
    { href: '/resenas', label: 'Resenas' },
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { itemCount, setIsOpen } = useCart();
    const { user, isLoggedIn, loading, logout } = useCustomer();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    async function handleLogout() {
        await logout();
        setMobileMenuOpen(false);
        router.push('/');
    }

    const mobileNav = (
        <div className={mobileMenuOpen ? 'mobile-nav-overlay open' : 'mobile-nav-overlay'} onClick={() => setMobileMenuOpen(false)}>
            <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
                <button className="mobile-nav-close" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menu">
                    X
                </button>
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={pathname === item.href ? 'mobile-nav-item active' : 'mobile-nav-item'}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        {item.label}
                    </Link>
                ))}

                {isLoggedIn && (
                    <button className="mobile-nav-item mobile-nav-logout" onClick={handleLogout}>
                        Cerrar sesion
                    </button>
                )}

                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="whatsapp-btn whatsapp-btn-mobile">
                    <span className="whatsapp-icon">W</span>
                    <span>WhatsApp</span>
                </a>
            </nav>
        </div>
    );

    return (
        <header className="header">
            <div className="logo">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" stroke="currentColor" strokeWidth="2" />
                    <path d="M17 9h2a2 2 0 0 1 0 4h-2" stroke="currentColor" strokeWidth="2" />
                    <line x1="4" y1="19" x2="17" y2="19" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span>Brew&nbsp;&amp;&nbsp;Co.</span>
            </div>

            <nav className="nav glass desktop-only">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={pathname === item.href ? 'nav-item active' : 'nav-item'}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="header-actions">
                {!loading && (
                    <>
                        <Link href={isLoggedIn ? '/perfil' : '/login'} className="account-link">
                            {isLoggedIn ? (
                                <>
                                    <span className="account-nickname">{user.nickname}</span>
                                    <span className="account-points">{user.points} pts</span>
                                </>
                            ) : (
                                <span className="account-nickname">Ingresar</span>
                            )}
                        </Link>

                        {isLoggedIn && (
                            <button className="logout-icon-btn desktop-only" onClick={handleLogout} aria-label="Cerrar sesion" title="Cerrar sesion">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        )}
                    </>
                )}

                <button className="cart-btn" onClick={() => setIsOpen(true)} aria-label="Abrir carrito">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="21" r="1.5" fill="currentColor" />
                        <circle cx="18" cy="21" r="1.5" fill="currentColor" />
                        <path
                            d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21 7H6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </button>

                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="whatsapp-btn desktop-only" aria-label="Escribenos por WhatsApp">
                    <span className="whatsapp-icon">W</span>
                    <span>WhatsApp</span>
                </a>

                <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            {mounted && createPortal(mobileNav, document.body)}
        </header>
    );
}