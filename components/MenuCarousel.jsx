'use client';

import { useCart } from './CartProvider';
import { useCurrency } from './CurrencyProvider';

const PRODUCTS = [
    {
        name: 'Espresso Clásico',
        priceUsd: 4.5,
        image: '/assets/images/menu/espresso.png',
        description: 'Doble shot, cuerpo intenso y crema dorada.',
    },
    {
        name: 'Cappuccino',
        priceUsd: 5.0,
        image: '/assets/images/menu/cappuccino.avif',
        description: 'Espresso, leche vaporizada y una capa de espuma sedosa.',
    },
    {
        name: 'Latte de Caramelo',
        priceUsd: 5.5,
        image: '/assets/images/menu/latte-caramelo.avif',
        description: 'Café suave con leche cremosa y jarabe de caramelo.',
    },
    {
        name: 'Mocha',
        priceUsd: 5.8,
        image: '/assets/images/menu/mocha.jpg',
        description: 'Espresso, chocolate oscuro y leche vaporizada.',
    },
    {
        name: 'Cold Brew',
        priceUsd: 4.8,
        image: '/assets/images/menu/cold-brew.jpg',
        description: 'Extracción en frío por 18 horas, suave y con poca acidez.',
    },
    {
        name: 'Frappé de Vainilla',
        priceUsd: 5.6,
        image: '/assets/images/menu/frappe-vainilla.avif',
        description: 'Café helado batido con vainilla y crema.',
    },
    {
        name: 'Latte Helado',
        priceUsd: 5.2,
        image: '/assets/images/menu/latte-helado.jpg',
        description: 'Espresso doble sobre hielo con leche fría.',
    },
    {
        name: 'Nitro Cold Brew',
        priceUsd: 5.9,
        image: '/assets/images/menu/nitro-cold-brew.webp',
        description: 'Cold brew infusionado con nitrógeno, textura cremosa.',
    },
    {
        name: 'Croissant de Almendra',
        priceUsd: 4.2,
        image: '/assets/images/menu/croissant-almendra.webp',
        description: 'Hojaldre relleno de crema de almendra.',
    },
    {
        name: 'Muffin de Arándanos',
        priceUsd: 3.8,
        image: '/assets/images/menu/muffin-arandanos.jpg',
        description: 'Horneado diario, esponjoso y jugoso.',
    },
    {
        name: 'Cheesecake de Café',
        priceUsd: 5.5,
        image: '/assets/images/menu/cheesecake-cafe.jpg',
        description: 'Base de galleta, relleno cremoso con espresso.',
    },
    {
        name: 'Brownie de Chocolate',
        priceUsd: 4.0,
        image: '/assets/images/menu/brownie-chocolate.jpg',
        description: 'Denso, con nueces y chispas de chocolate oscuro.',
    },
];

function MenuCard({ product }) {
    const { addItem } = useCart();
    const { format } = useCurrency();

    return (
        <div className="menu-card">
            <div className="menu-card-photo">
                <img src={product.image} alt={product.name} />
            </div>
            <div className="menu-card-body">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="menu-card-footer">
                    <span className="menu-price">{format(product.priceUsd)}</span>
                    <button
                        className="menu-add"
                        aria-label={`Agregar ${product.name}`}
                        onClick={() => addItem({ name: product.name, priceUsd: product.priceUsd })}
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MenuCarousel() {
    return (
        <main className="page menu-page">
            <div className="page-heading">
                <span className="eyebrow">BREW & CO.</span>
                <h1>Nuestra Carta</h1>
            </div>

            <div className="menu-carousel">
                <div className="menu-track">
                    {/* Duplicamos la lista una vez para que el loop del carrusel sea infinito y sin corte */}
                    {[...PRODUCTS, ...PRODUCTS].map((product, i) => (
                        <MenuCard product={product} key={`${product.name}-${i}`} />
                    ))}
                </div>
            </div>
        </main>
    );
}
