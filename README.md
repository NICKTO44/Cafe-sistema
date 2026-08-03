# Brew & Co. — Next.js + backend real

Migración completa del sitio estático a Next.js (App Router), con backend real para
recibir y administrar pedidos.

## 🚀 Cómo correrlo (primera vez)

Necesitas tener [Node.js](https://nodejs.org) instalado (v18 o superior).

```bash
# 1. Instalar dependencias
npm install

# 2. Crear la base de datos SQLite y las tablas
npx prisma migrate dev --name init

# 3. Levantar el servidor de desarrollo
npm run dev
```

Abre **http://localhost:3000** — el sitio del cliente.
Abre **http://localhost:3000/admin** — el panel de pedidos (contraseña en `.env`).

> La contraseña del panel admin está en el archivo `.env`, variable `ADMIN_PASSWORD`
> (por defecto `brewco2026`). Cámbiala antes de usar esto en producción.

## 📁 Estructura

```
brew-co/
├── app/
│   ├── layout.js              → <html>/<body>, fuentes, GSAP, providers globales
│   ├── (site)/                → páginas del cliente (comparten Header/Carrito/Moneda)
│   │   ├── layout.js           → Header + vapor + carrito + switch de moneda
│   │   ├── page.js             → Inicio
│   │   ├── menu/page.js        → Menú (carrusel + 12 productos + carrito)
│   │   ├── granos/page.js
│   │   ├── tueste/page.js
│   │   └── resenas/page.js
│   ├── admin/
│   │   ├── login/page.js       → login (contraseña simple)
│   │   └── page.js              → dashboard de pedidos en tiempo real
│   └── api/
│       ├── orders/route.js      → POST crear pedido · GET listar (admin)
│       ├── orders/[id]/route.js → PATCH cambiar estado
│       ├── orders/stream/route.js → Server-Sent Events (tiempo real)
│       ├── rate/route.js        → tipo de cambio USD→PEN (cacheado)
│       └── admin/login|logout/route.js
│
├── components/                 → Header, CartDrawer, CurrencySwitch, HeroInteractive, etc.
├── lib/                         → conexión Prisma, eventos SSE, auth, caché de tasa
├── prisma/schema.prisma         → modelos Order y OrderItem (SQLite)
├── public/assets/images/        → tus fotos (Home + Menú)
├── styles/                      → tus CSS originales, casi sin cambios
└── middleware.js                → protege /admin y las rutas admin de la API
```

## 🛒 Cómo funciona el carrito → pedido

1. El cliente navega el Menú y presiona "+" en un producto → se guarda en `localStorage`
   (persiste entre páginas, gracias al Header/Carrito compartido en `(site)/layout.js`).
2. Abre el carrito (ícono en el header), revisa cantidades, presiona "Continuar".
3. Completa nombre + tipo de pedido (mesa/llevar).
4. Al confirmar, se hace `POST /api/orders` → se guarda en la base de datos real (SQLite)
   y se emite un evento en tiempo real.
5. El panel `/admin` está escuchando ese evento (Server-Sent Events) y el pedido
   aparece al instante, sin recargar la página.

## 💱 Moneda global (USD/PEN)

El switch flotante (abajo a la izquierda, en las 5 páginas) llama a `/api/rate`,
que consulta `open.er-api.com` **desde el servidor** (no desde cada navegador) y
cachea el resultado 12 horas. Todos los precios del sitio —incluidos los 2 productos
de muestra del Inicio— se recalculan al vuelo con `useCurrency()`.

## 🗄️ Base de datos

SQLite con [Prisma](https://www.prisma.io/) — un solo archivo (`prisma/dev.db`, se
crea con `npx prisma migrate dev`). Para ver/editar los datos con una interfaz visual:

```bash
npm run db:studio
```

Cuando quieras subir esto a un hosting real (Vercel, Railway, Render), lo único que
cambia es la variable `DATABASE_URL` en `.env` (puedes migrar a Postgres cambiando
una línea en `prisma/schema.prisma` — el resto del código no cambia).

## ⚠️ Notas importantes

- **`npm install` debe correr en tu computadora**, no en un entorno restringido: el
  paso `prisma generate` (que corre automático después de instalar) descarga un
  binario desde internet. Con tu conexión normal esto funciona sin problema.
- El precio de cada producto vive en `components/MenuCarousel.jsx` (array `PRODUCTS`)
  — para agregar/editar productos del menú, edita ese archivo (ya no hace falta tocar
  HTML repetido en cada tarjeta).
- Todas las animaciones (parallax de la taza, specks, vapor, carrusel infinito) se
  migraron tal cual las tenías, solo reescritas dentro de componentes de React.
