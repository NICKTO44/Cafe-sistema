import { NextResponse } from 'next/server';
import { CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';

export async function POST() {
    const response = NextResponse.json({ ok: true });
    response.cookies.delete(CUSTOMER_COOKIE_NAME);
    return response;
}