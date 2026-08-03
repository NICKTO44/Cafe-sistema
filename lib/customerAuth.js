// Autenticación de clientes (celular + apodo + contraseña).
// Usamos Web Crypto (SubtleCrypto) en vez de bcrypt/node:crypto porque
// este código corre tanto en middleware.js (runtime "edge") como en
// las rutas de API (runtime Node) — Web Crypto funciona en ambos.

export const CUSTOMER_COOKIE_NAME = 'brewco_session';
const SESSION_DAYS = 30;

async function getKey() {
    const secret = process.env.SESSION_SECRET;
    const encoder = new TextEncoder();
    return crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

function toHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

// --- Contraseñas: hash con PBKDF2 (Web Crypto no trae bcrypt, pero PBKDF2 es un estándar seguro) ---

export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
        'deriveBits',
    ]);
    const derived = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        256
    );
    return `${toHex(salt)}:${toHex(derived)}`;
}

export async function verifyPassword(password, stored) {
    const [saltHex, hashHex] = stored.split(':');
    if (!saltHex || !hashHex) return false;

    const salt = new Uint8Array(saltHex.match(/.{2}/g).map((b) => parseInt(b, 16)));
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
        'deriveBits',
    ]);
    const derived = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        256
    );
    return toHex(derived) === hashHex;
}

// --- Sesión: token firmado "userId.expira.firma", sin necesidad de tabla de sesiones ---

export async function createSessionToken(userId) {
    const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
    const payload = `${userId}.${expires}`;
    const key = await getKey();
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    return `${payload}.${toHex(signature)}`;
}

export async function verifySessionToken(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [userIdStr, expiresStr, signatureHex] = parts;
    const expires = Number(expiresStr);
    if (!expires || Date.now() > expires) return null;

    const payload = `${userIdStr}.${expiresStr}`;
    const key = await getKey();
    const expectedSignature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));

    if (toHex(expectedSignature) !== signatureHex) return null;

    const userId = Number(userIdStr);
    return Number.isInteger(userId) ? userId : null;
}