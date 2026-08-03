import { NextResponse } from 'next/server';
import { getUsdToPenRate } from '@/lib/rateCache';

export async function GET() {
    const result = await getUsdToPenRate();
    return NextResponse.json(result);
}
