import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting store (suitable for single-instance deployments)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT = 10; // requests per window
const WINDOW_MS = 60 * 1000; // 1 minute window
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean expired entries every 5 minutes

// Periodic cleanup to prevent memory leaks
let lastCleanup = Date.now();

function cleanupExpiredEntries(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }
  
  for (const [key, data] of requestCounts.entries()) {
    if (data.resetTime < now) {
      requestCounts.delete(key);
    }
  }
  
  lastCleanup = now;
}

function getClientIP(request: NextRequest): string {
  // Check for forwarded IP first (for proxies, load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Check for real IP header
  const real = request.headers.get('x-real-ip');
  if (real) {
    return real.trim();
  }
  
  // Check for CF-Connecting-IP (Cloudflare)
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP.trim();
  }
  
  // Fallback to localhost for local development
  return '127.0.0.1';
}

export async function middleware(request: NextRequest) {
  const ip = getClientIP(request);
  const now = Date.now();
  
  // Periodic cleanup of expired entries
  cleanupExpiredEntries(now);
  
  // Get current rate limit data for this IP
  const current = requestCounts.get(ip);
  
  // If no existing data or window has expired, start new window
  if (!current || current.resetTime < now) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS
    });
    
    // Add rate limit headers for successful requests
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
    response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT - 1).toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil((now + WINDOW_MS) / 1000).toString());
    
    return response;
  }
  
  // Check if rate limit exceeded
  if (current.count >= RATE_LIMIT) {
    const retryAfterSeconds = Math.ceil((current.resetTime - now) / 1000);
    
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again in a minute.',
        retryAfter: retryAfterSeconds
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(current.resetTime / 1000).toString(),
          'Retry-After': retryAfterSeconds.toString(),
          'Content-Type': 'application/json',
        }
      }
    );
  }
  
  // Increment count for this IP
  current.count++;
  
  // Add rate limit headers for successful requests
  const remaining = Math.max(0, RATE_LIMIT - current.count);
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000).toString());
  
  return response;
}

// Configure middleware to only run on the generate-zine API endpoint
export const config = {
  matcher: ['/api/generate-zine']
};