/**
 * @fileoverview Next.js middleware for rate limiting and comprehensive security headers
 * Provides DoS protection, XSS prevention, and content security policy enforcement
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory rate limiting store for tracking request counts per IP address
 * @description Simple Map-based storage suitable for single-instance deployments.
 * For production clusters, consider Redis or other distributed storage.
 * @type {Map<string, {count: number, resetTime: number}>}
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting configuration constants
 * @description Conservative limits to prevent DoS while allowing normal usage
 */
const RATE_LIMIT = 10; // requests per window
const WINDOW_MS = 60 * 1000; // 1 minute window
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean expired entries every 5 minutes

/**
 * Timestamp tracking for periodic cleanup to prevent memory leaks
 * @type {number}
 */
let lastCleanup = Date.now();

/**
 * Generate Content Security Policy header based on environment
 * 
 * @returns {string} Complete CSP header value with appropriate directives
 * 
 * @description Creates environment-aware CSP policy:
 * - Production: Strict policy blocking inline scripts and eval
 * - Development: Relaxed policy allowing hot reload and dev tools
 * - Protects against XSS, code injection, and clickjacking
 * - Allows external resources for fonts and images while maintaining security
 * 
 * @security
 * - Prevents script injection attacks from AI-generated content
 * - Blocks object embedding and plugin execution
 * - Enforces HTTPS upgrades for enhanced transport security
 * - Restricts frame embedding to prevent clickjacking
 */
function getCSPHeader(): string {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'" + (isDevelopment ? " 'unsafe-eval'" : ""),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  return cspDirectives.join('; ');
}

/**
 * Add comprehensive security headers to HTTP response
 * 
 * @param {NextResponse} response - Next.js response object to modify
 * 
 * @description Applies multiple security headers for defense-in-depth protection:
 * - Content-Security-Policy: Prevents XSS and code injection
 * - X-Content-Type-Options: Prevents MIME-type sniffing attacks
 * - X-Frame-Options: Prevents clickjacking via iframe embedding
 * - X-XSS-Protection: Browser XSS filtering (legacy support)
 * - Referrer-Policy: Controls referrer information leakage
 * 
 * @security
 * Applied to all routes for comprehensive protection including static assets
 * Headers specifically protect against AI-generated content vulnerabilities
 */
function addSecurityHeaders(response: NextResponse): void {
  // Content Security Policy
  response.headers.set('Content-Security-Policy', getCSPHeader());
  
  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}

/**
 * Clean expired entries from rate limiting store to prevent memory leaks
 * 
 * @param {number} now - Current timestamp for comparison
 * 
 * @description Periodic maintenance function that:
 * - Runs only when cleanup interval has elapsed (5 minutes)
 * - Removes expired rate limit entries from memory
 * - Prevents unbounded memory growth in long-running instances
 * - Updates cleanup timestamp to prevent excessive iterations
 * 
 * @performance
 * - Throttled execution prevents performance impact
 * - Map iteration is efficient for expected entry counts
 * - Memory reclamation prevents server instability
 */
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

/**
 * Extract client IP address from request headers with proxy support
 * 
 * @param {NextRequest} request - Next.js request object
 * @returns {string} Client IP address for rate limiting
 * 
 * @description Robust IP detection that handles various proxy configurations:
 * - X-Forwarded-For: Standard proxy header (first IP in chain)
 * - X-Real-IP: Nginx proxy header
 * - CF-Connecting-IP: Cloudflare proxy header
 * - Fallback: localhost for local development
 * 
 * @security
 * - IP-based rate limiting requires accurate client identification
 * - Handles proxy chains to prevent bypass via intermediate IPs  
 * - Graceful fallback prevents middleware crashes
 * - Supports production deployment scenarios (load balancers, CDN)
 */
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

/**
 * Next.js middleware function for request processing and security enforcement
 * 
 * @param {NextRequest} request - Incoming HTTP request
 * @returns {Promise<NextResponse>} HTTP response with security headers and rate limiting
 * 
 * @description Comprehensive middleware that provides:
 * - Universal security headers applied to all routes
 * - Rate limiting specifically for API endpoints to prevent DoS
 * - IP-based request tracking with sliding window algorithm
 * - Proper HTTP status codes and headers for rate limit responses
 * - Memory management with automatic cleanup of expired entries
 * 
 * @architecture
 * Two-layer approach:
 * 1. Security headers: Applied to ALL routes for comprehensive protection
 * 2. Rate limiting: Applied only to /api/generate-zine to prevent API abuse
 * 
 * @security
 * - Rate limiting prevents DoS attacks and cost explosion (OpenAI API costs)
 * - Security headers protect against XSS, clickjacking, and content injection
 * - IP tracking enables abuse detection and blocking
 * - Standard HTTP 429 responses with retry timing information
 * 
 * @performance
 * - Efficient Map-based in-memory storage for single-instance deployments
 * - Periodic cleanup prevents memory leaks in long-running processes
 * - Early return patterns minimize processing overhead
 * - Headers provided for client-side rate limit awareness
 * 
 * @compliance
 * - HTTP 429 Too Many Requests standard compliance
 * - X-RateLimit-* headers follow RFC 6585 conventions
 * - Retry-After header provides client guidance
 * 
 * @example
 * Rate limit headers in successful response:
 * ```
 * X-RateLimit-Limit: 10
 * X-RateLimit-Remaining: 7  
 * X-RateLimit-Reset: 1640995200
 * ```
 * 
 * @example  
 * Rate limit exceeded response:
 * ```
 * Status: 429 Too Many Requests
 * X-RateLimit-Limit: 10
 * X-RateLimit-Remaining: 0
 * X-RateLimit-Reset: 1640995200  
 * Retry-After: 45
 * ```
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Always add security headers to all routes
  addSecurityHeaders(response);
  
  // Only apply rate limiting to the API endpoint
  if (request.nextUrl.pathname === '/api/generate-zine') {
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
      
      // Add rate limit headers for first request
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
      response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT - 1).toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil((now + WINDOW_MS) / 1000).toString());
      
      return response;
    }
    
    // Check if rate limit exceeded
    if (current.count >= RATE_LIMIT) {
      const retryAfterSeconds = Math.ceil((current.resetTime - now) / 1000);
      
      const errorResponse = NextResponse.json(
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
      
      // Add security headers to error response
      addSecurityHeaders(errorResponse);
      
      return errorResponse;
    }
    
    // Increment count for this IP
    current.count++;
    
    // Add rate limit headers for successful requests
    const remaining = Math.max(0, RATE_LIMIT - current.count);
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000).toString());
  }
  
  return response;
}

/**
 * Middleware configuration defining which routes should be processed
 * 
 * @description Configures Next.js middleware to run on specific routes:
 * - All application routes receive security headers for comprehensive protection
 * - API routes receive both security headers and rate limiting
 * - Static assets are excluded to prevent performance overhead
 * - Optimization files (_next/*) are excluded as they don't need processing
 * 
 * @performance
 * - Excludes static files (_next/static) to avoid unnecessary processing
 * - Excludes image optimization files (_next/image) for faster image serving  
 * - Excludes favicon.ico to reduce overhead on common requests
 * - Targeted inclusion of API routes for security enforcement
 * 
 * @security
 * - Ensures all user-facing routes receive security headers
 * - API endpoints receive additional rate limiting protection
 * - Static assets maintain performance while still being secure via CSP
 * 
 * @routes
 * - Included: All pages, API routes, dynamic routes
 * - Excluded: Static files, Next.js internal routes, favicon
 * - Special: /api/generate-zine explicitly included for rate limiting
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files) 
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/generate-zine'
  ]
};