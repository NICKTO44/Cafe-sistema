import '../../styles/cart.css';
import '../../styles/currency-switch.css';
import '../../styles/customer.css';

import Header from '@/components/Header';
import SteamBackground from '@/components/SteamBackground';
import CartDrawer from '@/components/CartDrawer';
import CurrencySwitch from '@/components/CurrencySwitch';
import { CustomerProvider } from '@/components/CustomerProvider';
import OrderStatusBanner from '@/components/OrderStatusBanner';

export default function SiteLayout({ children }) {
    return (
        <CustomerProvider>
            <SteamBackground />
            <Header />
            {children}
            <CartDrawer />
            <CurrencySwitch />
            <OrderStatusBanner />
        </CustomerProvider>
    );
}