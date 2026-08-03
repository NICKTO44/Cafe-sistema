'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'brewco_cart';

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // Cargar el carrito guardado al montar (solo existe `localStorage` en el navegador)
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setItems(JSON.parse(saved));
        } catch (e) {
            console.warn('No se pudo leer el carrito guardado:', e);
        }
        setHydrated(true);
    }, []);

    // Guardar cada vez que cambia, pero no antes de terminar de cargar
    // (si no, sobrescribiríamos el carrito guardado con un array vacío)
    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.warn('No se pudo guardar el carrito:', e);
        }
    }, [items, hydrated]);

    function addItem(product) {
        setItems((prev) => {
            const existing = prev.find((i) => i.name === product.name);
            if (existing) {
                return prev.map((i) =>
                    i.name === product.name ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { name: product.name, priceUsd: product.priceUsd, quantity: 1 }];
        });
        setIsOpen(true);
    }

    function updateQty(name, delta) {
        setItems((prev) =>
            prev
                .map((i) => (i.name === name ? { ...i, quantity: i.quantity + delta } : i))
                .filter((i) => i.quantity > 0)
        );
    }

    function removeItem(name) {
        setItems((prev) => prev.filter((i) => i.name !== name));
    }

    function clearCart() {
        setItems([]);
    }

    const totalUsd = items.reduce((sum, i) => sum + i.priceUsd * i.quantity, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider
            value={{ items, isOpen, setIsOpen, addItem, updateQty, removeItem, clearCart, totalUsd, itemCount }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
    return ctx;
}
