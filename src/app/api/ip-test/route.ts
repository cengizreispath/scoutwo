import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Get various IP headers that proxies might set
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  // Parse the first IP from x-forwarded-for if available
  const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || cfConnectingIp || 'unknown';
  
  return NextResponse.json({
    status: 'success',
    message: 'IP detection test endpoint',
    data: {
      clientIp,
      headers: {
        'x-forwarded-for': forwardedFor,
        'x-real-ip': realIp,
        'cf-connecting-ip': cfConnectingIp,
      },
      allHeaders: Object.fromEntries(request.headers.entries()),
    },
    timestamp: new Date().toISOString(),
  });
}
