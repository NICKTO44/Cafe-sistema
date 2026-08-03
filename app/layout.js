import Script from 'next/script';
import '../styles/base.css';

import { CartProvider } from '@/components/CartProvider';
import { CurrencyProvider } from '@/components/CurrencyProvider';

export const metadata = {
    title: 'Brew & Co. | Café de Especialidad',
    description: 'Café de especialidad, tostado lento, servido con cuidado. Cada taza cuenta una historia.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Manrope:wght@400;700&family=Galada&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                {/* GSAP debe estar listo antes de que las páginas interactivas monten su lógica */}
                <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" strategy="beforeInteractive" />

                <CartProvider>
                    <CurrencyProvider>{children}</CurrencyProvider>
                </CartProvider>
            </body>
        </html>
    );
}
