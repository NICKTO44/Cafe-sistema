// Autenticación simple de un solo usuario para el panel de administración.
// No hay tabla de usuarios: se compara contra ADMIN_PASSWORD del .env
// y, si coincide, se guarda una cookie httpOnly con el valor de SESSION_SECRET.
// Middleware.js compara esa cookie en cada request a /admin/*.

export const ADMIN_COOKIE_NAME = 'brewco_admin_session';

export function isValidAdminPassword(password) {
    return password === process.env.ADMIN_PASSWORD;
}

export function getExpectedSessionValue() {
    return process.env.SESSION_SECRET;
}
