'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
    const [user, setUser] = useState(null); // { id, phone, nickname, points } | null
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const res = await fetch('/api/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (e) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    async function logout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
    }

    return (
        <CustomerContext.Provider value={{ user, loading, isLoggedIn: !!user, refresh, logout }}>
            {children}
        </CustomerContext.Provider>
    );
}

export function useCustomer() {
    const ctx = useContext(CustomerContext);
    if (!ctx) throw new Error('useCustomer debe usarse dentro de <CustomerProvider>');
    return ctx;
}