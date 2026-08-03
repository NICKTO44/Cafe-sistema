'use client';

import { useCurrency } from './CurrencyProvider';

export default function CurrencySwitch() {
    const { currency, switchTo, loadingRate } = useCurrency();

    return (
        <div className="currency-switch-floating">
            <div className="currency-switch glass">
                <button
                    className={`currency-option ${currency === 'USD' ? 'active' : ''}`}
                    onClick={() => switchTo('USD')}
                >
                    USD
                </button>
                <button
                    className={`currency-option ${currency === 'PEN' ? 'active' : ''}`}
                    onClick={() => switchTo('PEN')}
                >
                    {loadingRate ? '...' : 'S/ PEN'}
                </button>
            </div>
        </div>
    );
}
