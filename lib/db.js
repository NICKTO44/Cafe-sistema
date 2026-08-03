import { PrismaClient } from '@prisma/client';

// En desarrollo, Next.js recarga módulos con cada cambio de archivo.
// Guardamos la instancia en `global` para no abrir una conexión nueva cada vez.
const globalForPrisma = global;

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
