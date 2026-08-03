// Cachea el tipo de cambio en el servidor por 12 horas, para no golpear
// la API externa en cada visita de cada cliente.

const CACHE_HOURS = 12;
const FALLBACK_RATE = 3.75; // se usa solo si la API externa falla y no hay caché

const globalForRate = global;
if (!globalForRate.rateCache) {
    globalForRate.rateCache = { rate: null, timestamp: 0 };
}

export async function getUsdToPenRate() {
    const cache = globalForRate.rateCache;
    const isFresh = cache.rate && (Date.now() - cache.timestamp) < CACHE_HOURS * 60 * 60 * 1000;

    if (isFresh) {
        return { rate: cache.rate, cached: true };
    }

    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD', {
            cache: 'no-store',
        });
        if (!res.ok) throw new Error('Respuesta no válida de la API de tipo de cambio');

        const data = await res.json();
        const rate = data?.rates?.PEN;
        if (!rate) throw new Error('PEN no encontrado en la respuesta');

        globalForRate.rateCache = { rate, timestamp: Date.now() };
        return { rate, cached: false };
    } catch (err) {
        console.error('No se pudo obtener el tipo de cambio real:', err.message);
        // Si había un valor cacheado aunque esté vencido, mejor eso que el fallback fijo
        if (cache.rate) return { rate: cache.rate, cached: true, stale: true };
        return { rate: FALLBACK_RATE, cached: false, fallback: true };
    }
}
