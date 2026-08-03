'use client';

import { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext(null);
const FALLBACK_RATE = 3.75;

export function CurrencyProvider({ children }) {
    const [currency, setCurrency] = useState('USD');
    const [rate, setRate] = useState(null);
    const [loadingRate, setLoadingRate] = useState(false);

    async function switchTo(target) {
        if (target === currency) return;

        if (target === 'PEN' && rate === null) {
            setLoadingRate(true);
            try {
                const res = await fetch('/api/rate');
                const data = await res.json();
                setRate(data.rate || FALLBACK_RATE);
            } catch (e) {
                console.error('No se pudo obtener el tipo de cambio real, usando valor de respaldo:', e);
                setRate(FALLBACK_RATE);
            } finally {
                setLoadingRate(false);
            }
        }

        setCurrency(target);
    }

    function format(usdAmount) {
        if (currency === 'PEN' && rate) {
            return `S/ ${(usdAmount * rate).toFixed(2)}`;
        }
        return `$${usdAmount.toFixed(2)}`;
    }

    return (
        <CurrencyContext.Provider value={{ currency, rate, loadingRate, switchTo, format }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error('useCurrency debe usarse dentro de <CurrencyProvider>');
    return ctx;
}
