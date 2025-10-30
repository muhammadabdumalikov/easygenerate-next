import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip in development and for localhost
  const host = request.headers.get('host') || '';
  const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  if (process.env.NODE_ENV !== 'production' || isLocalhost) {
    return NextResponse.next();
  }

  // Enforce HTTPS based on proxy header
  const proto = request.headers.get('x-forwarded-proto');
  if (proto && proto !== 'https') {
    const url = new URL(request.url);
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|api|.*\\.\
(?:png|jpg|jpeg|gif|svg|ico|webp|txt|xml|json)).*)',
  ],
};


