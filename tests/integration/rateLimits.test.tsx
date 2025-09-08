import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';

// Mock Clerk server - must be before middleware import
vi.mock('@clerk/nextjs/server', () => {
  const authFunc = vi.fn(() => Promise.resolve({ userId: null }));
  return {
    auth: authFunc,
    getAuth: vi.fn(() => ({ userId: null })),
    clerkMiddleware: vi.fn((handler) => {
      // Return a middleware function that calls the handler with auth and request
      return async (request: NextRequest) => {
        return handler(authFunc, request);
      };
    })
  };
});

// Mock Convex browser client
vi.mock('convex/browser', () => ({
  ConvexHttpClient: vi.fn().mockImplementation(() => ({
    query: vi.fn(),
    mutation: vi.fn()
  }))
}));

// Mock session migration
vi.mock('@/lib/sessionMigration', () => ({
  ensureSessionId: vi.fn((request, response) => ({
    sessionId: 'test_session_id',
    isNew: false
  }))
}));

// Import middleware after mocks
import middlewareExport from '@/middleware';
import { auth } from '@clerk/nextjs/server';

// Mock Convex client
const mockConvexQuery = vi.fn();
const mockConvexMutation = vi.fn();

// Get mocked functions
const mockAuthFunc = auth as ReturnType<typeof vi.fn>;
const mockUseUser = useUser as ReturnType<typeof vi.fn>;
const mockUseQuery = useQuery as ReturnType<typeof vi.fn>;

describe('Rate Limiting Integration', () => {
  let middleware: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud';
    process.env.CONVEX_URL = 'https://test.convex.cloud';
    process.env.CONVEX_DEPLOYMENT_URL_PROD = 'https://test.convex.cloud';
    
    // Default to anonymous user
    mockAuthFunc.mockResolvedValue({ userId: null });
    
    // Get the middleware
    middleware = middlewareExport;
    
    // Mock successful Convex responses by default
    mockConvexQuery.mockResolvedValue({
      allowed: true,
      remaining: 2,
      resetAt: Date.now() + 3600000,
      tier: 'anonymous'
    });
    
    mockConvexMutation.mockResolvedValue({
      success: true
    });
  });

  afterEach(() => {
    // Clean up any timers
    vi.clearAllTimers();
  });

  describe('Tiered Rate Limits', () => {
    it('should enforce 2 requests per hour for anonymous users', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1'
        }
      });

      // First request - should pass
      mockConvexQuery.mockResolvedValueOnce({
        allowed: true,
        remaining: 1,
        resetAt: Date.now() + 3600000,
        tier: 'anonymous'
      });

      const response1 = await middleware(request);
      expect(response1.status).not.toBe(429);
      expect(response1.headers.get('X-RateLimit-Limit')).toBe('2');
      expect(response1.headers.get('X-RateLimit-Remaining')).toBe('1');
      expect(response1.headers.get('X-RateLimit-Tier')).toBe('anonymous');

      // Second request - should pass
      mockConvexQuery.mockResolvedValueOnce({
        allowed: true,
        remaining: 0,
        resetAt: Date.now() + 3600000,
        tier: 'anonymous'
      });

      const response2 = await middleware(request.clone());
      expect(response2.status).not.toBe(429);
      expect(response2.headers.get('X-RateLimit-Remaining')).toBe('0');

      // Third request - should be rate limited
      mockConvexQuery.mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 3600000,
        tier: 'anonymous'
      });

      const response3 = await middleware(request.clone());
      expect(response3.status).toBe(429);
      
      const body = await response3.json();
      expect(body.error).toContain('Too many requests');
      expect(body.upgradeAvailable).toBe(true);
      expect(body.tier).toBe('anonymous');
    });

    it('should enforce 10 requests per day for authenticated users', async () => {
      // Mock authenticated user
      mockAuthFunc.mockResolvedValue({ userId: 'user_123' });
      
      mockConvexQuery.mockResolvedValue({
        allowed: true,
        remaining: 9,
        resetAt: Date.now() + 86400000, // 24 hours
        tier: 'authenticated'
      });

      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST'
      });

      const response = await middleware(request);
      expect(response.status).not.toBe(429);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('9');
      expect(response.headers.get('X-RateLimit-Tier')).toBe('authenticated');
    });

    it('should return different tier limits in headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST'
      });

      // Test anonymous tier
      mockAuthFunc.mockResolvedValue({ userId: null });
      mockConvexQuery.mockResolvedValueOnce({
        allowed: true,
        remaining: 2,
        resetAt: Date.now() + 3600000,
        tier: 'anonymous'
      });

      const anonResponse = await middleware(request.clone());
      expect(anonResponse.headers.get('X-RateLimit-Limit')).toBe('2');
      expect(anonResponse.headers.get('X-RateLimit-Tier')).toBe('anonymous');

      // Test authenticated tier
      mockAuthFunc.mockResolvedValue({ userId: 'user_123' });
      mockConvexQuery.mockResolvedValueOnce({
        allowed: true,
        remaining: 10,
        resetAt: Date.now() + 86400000,
        tier: 'authenticated'
      });

      const authResponse = await middleware(request.clone());
      expect(authResponse.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(authResponse.headers.get('X-RateLimit-Tier')).toBe('authenticated');
    });
  });

  describe('Fallback to In-Memory Storage', () => {
    it('should fallback to in-memory storage when Convex is unavailable', async () => {
      // Mock Convex failure
      mockConvexQuery.mockRejectedValue(new Error('Convex connection failed'));

      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.2'
        }
      });

      // Should still work with in-memory fallback
      const response1 = await middleware(request.clone());
      expect(response1.status).not.toBe(429);
      
      // Headers should still be set from in-memory storage
      expect(response1.headers.get('X-RateLimit-Limit')).toBe('2');
      expect(response1.headers.get('X-RateLimit-Remaining')).toBeTruthy();
      expect(response1.headers.get('X-RateLimit-Tier')).toBe('anonymous');
    });

    it('should maintain rate limits in memory during Convex outage', async () => {
      // Mock Convex failure
      mockConvexQuery.mockRejectedValue(new Error('Convex unavailable'));
      mockConvexMutation.mockRejectedValue(new Error('Convex unavailable'));

      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.3'
        }
      });

      // Make multiple requests - should be tracked in memory
      const responses = [];
      for (let i = 0; i < 3; i++) {
        const response = await middleware(request.clone());
        responses.push(response);
      }

      // First two should pass (anonymous limit is 2/hour)
      expect(responses[0].status).not.toBe(429);
      expect(responses[1].status).not.toBe(429);
      
      // Third should be rate limited
      expect(responses[2].status).toBe(429);
      const body = await responses[2].json();
      expect(body.error).toContain('Too many requests');
    });

    it('should handle Convex recovery gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.4'
        }
      });

      // Start with Convex failure
      mockConvexQuery.mockRejectedValueOnce(new Error('Convex down'));
      const response1 = await middleware(request.clone());
      expect(response1.status).not.toBe(429);

      // Convex recovers
      mockConvexQuery.mockResolvedValueOnce({
        allowed: true,
        remaining: 1,
        resetAt: Date.now() + 3600000,
        tier: 'anonymous'
      });

      const response2 = await middleware(request.clone());
      expect(response2.status).not.toBe(429);
      expect(response2.headers.get('X-RateLimit-Remaining')).toBe('1');
    });
  });

  describe('Rate Limit Headers', () => {
    it('should include all required rate limit headers', async () => {
      mockConvexQuery.mockResolvedValue({
        allowed: true,
        remaining: 5,
        resetAt: Date.now() + 3600000,
        tier: 'anonymous'
      });

      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST'
      });

      const response = await middleware(request);
      
      // Check all required headers
      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy();
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy();
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy();
      expect(response.headers.get('X-RateLimit-Tier')).toBeTruthy();
    });

    it('should include Retry-After header when rate limited', async () => {
      mockConvexQuery.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 3600000,
        tier: 'anonymous'
      });

      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST'
      });

      const response = await middleware(request);
      expect(response.status).toBe(429);
      
      const retryAfter = response.headers.get('Retry-After');
      expect(retryAfter).toBeTruthy();
      expect(parseInt(retryAfter!)).toBeGreaterThan(0);
      expect(parseInt(retryAfter!)).toBeLessThanOrEqual(3600);
    });

    it('should format reset time as Unix timestamp', async () => {
      const resetAt = Date.now() + 3600000;
      mockConvexQuery.mockResolvedValue({
        allowed: true,
        remaining: 1,
        resetAt,
        tier: 'anonymous'
      });

      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST'
      });

      const response = await middleware(request);
      const resetHeader = response.headers.get('X-RateLimit-Reset');
      expect(resetHeader).toBeTruthy();
      
      // Should be Unix timestamp in seconds (not milliseconds)
      const resetTimestamp = parseInt(resetHeader!);
      expect(resetTimestamp).toBe(Math.ceil(resetAt / 1000));
    });
  });

  describe('Session-Based Tracking', () => {
    it('should create session ID for anonymous users', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST'
      });

      const response = await middleware(request);
      
      // Should set session cookie
      const setCookieHeader = response.headers.get('set-cookie');
      expect(setCookieHeader).toBeTruthy();
      expect(setCookieHeader).toContain('anyzine_session=');
      expect(setCookieHeader).toContain('Max-Age=2592000'); // 30 days
    });

    it('should reuse existing session ID', async () => {
      const sessionId = 'existing_session_123';
      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST',
        headers: {
          cookie: `anyzine_session=${sessionId}`
        }
      });

      // Check that Convex is called with the session ID
      mockConvexQuery.mockImplementation(async (fn, args) => {
        expect(args.sessionId).toBe(sessionId);
        return {
          allowed: true,
          remaining: 2,
          resetAt: Date.now() + 3600000,
          tier: 'anonymous'
        };
      });

      await middleware(request);
      expect(mockConvexQuery).toHaveBeenCalled();
    });

    it('should track rate limits per session', async () => {
      // Different sessions should have separate limits
      const session1Request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST',
        headers: {
          cookie: 'anyzine_session=session_1'
        }
      });

      const session2Request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST',
        headers: {
          cookie: 'anyzine_session=session_2'
        }
      });

      // Both sessions should be allowed their own limits
      mockConvexQuery
        .mockResolvedValueOnce({
          allowed: true,
          remaining: 1,
          resetAt: Date.now() + 3600000,
          tier: 'anonymous'
        })
        .mockResolvedValueOnce({
          allowed: true,
          remaining: 1,
          resetAt: Date.now() + 3600000,
          tier: 'anonymous'
        });

      const response1 = await middleware(session1Request);
      const response2 = await middleware(session2Request);

      expect(response1.status).not.toBe(429);
      expect(response2.status).not.toBe(429);
    });
  });

  describe('IP-Based Tracking', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '203.0.113.1, 198.51.100.1'
        }
      });

      mockConvexQuery.mockImplementation(async (fn, args) => {
        // Should use first IP from forwarded list
        expect(args.ipAddress).toBe('203.0.113.1');
        return {
          allowed: true,
          remaining: 2,
          resetAt: Date.now() + 3600000,
          tier: 'anonymous'
        };
      });

      await middleware(request);
      expect(mockConvexQuery).toHaveBeenCalled();
    });

    it('should fallback to x-real-ip header', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST',
        headers: {
          'x-real-ip': '203.0.113.2'
        }
      });

      mockConvexQuery.mockImplementation(async (fn, args) => {
        expect(args.ipAddress).toBe('203.0.113.2');
        return {
          allowed: true,
          remaining: 2,
          resetAt: Date.now() + 3600000,
          tier: 'anonymous'
        };
      });

      await middleware(request);
      expect(mockConvexQuery).toHaveBeenCalled();
    });

    it('should handle Cloudflare CF-Connecting-IP header', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST',
        headers: {
          'cf-connecting-ip': '203.0.113.3'
        }
      });

      mockConvexQuery.mockImplementation(async (fn, args) => {
        expect(args.ipAddress).toBe('203.0.113.3');
        return {
          allowed: true,
          remaining: 2,
          resetAt: Date.now() + 3600000,
          tier: 'anonymous'
        };
      });

      await middleware(request);
      expect(mockConvexQuery).toHaveBeenCalled();
    });

    it('should default to localhost for local development', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST'
      });

      mockConvexQuery.mockImplementation(async (fn, args) => {
        expect(args.ipAddress).toBe('127.0.0.1');
        return {
          allowed: true,
          remaining: 2,
          resetAt: Date.now() + 3600000,
          tier: 'anonymous'
        };
      });

      await middleware(request);
      expect(mockConvexQuery).toHaveBeenCalled();
    });
  });

  describe('User-Based Tracking', () => {
    it('should track rate limits by user ID for authenticated users', async () => {
      mockAuthFunc.mockResolvedValue({ userId: 'user_456' });

      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST'
      });

      mockConvexQuery.mockImplementation(async (fn, args) => {
        expect(args.userId).toBe('user_456');
        expect(args.sessionId).toBeUndefined(); // Should not use session for auth users
        return {
          allowed: true,
          remaining: 9,
          resetAt: Date.now() + 86400000,
          tier: 'authenticated'
        };
      });

      await middleware(request);
      expect(mockConvexQuery).toHaveBeenCalled();
    });

    it('should not use IP or session for authenticated users', async () => {
      mockAuthFunc.mockResolvedValue({ userId: 'user_789' });

      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '203.0.113.4',
          'cookie': 'anyzine_session=should_be_ignored'
        }
      });

      mockConvexQuery.mockImplementation(async (fn, args) => {
        expect(args.userId).toBe('user_789');
        expect(args.sessionId).toBeUndefined();
        // IP might still be passed for logging but shouldn't be used for rate limiting
        return {
          allowed: true,
          remaining: 9,
          resetAt: Date.now() + 86400000,
          tier: 'authenticated'
        };
      });

      await middleware(request);
      expect(mockConvexQuery).toHaveBeenCalled();
    });
  });

  describe('Error Response Format', () => {
    it('should return proper 429 error response format', async () => {
      mockConvexQuery.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 3600000,
        tier: 'anonymous'
      });

      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST'
      });

      const response = await middleware(request);
      expect(response.status).toBe(429);

      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('retryAfter');
      expect(body).toHaveProperty('tier');
      expect(body).toHaveProperty('upgradeAvailable');

      expect(body.error).toContain('Too many requests');
      expect(typeof body.retryAfter).toBe('number');
      expect(body.tier).toBe('anonymous');
      expect(body.upgradeAvailable).toBe(true);
    });

    it('should not show upgrade option for authenticated users', async () => {
      mockAuthFunc.mockResolvedValue({ userId: 'user_123' });
      mockConvexQuery.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 86400000,
        tier: 'authenticated'
      });

      const request = new NextRequest('http://localhost:3000/api/generate-zine', {
        method: 'POST'
      });

      const response = await middleware(request);
      expect(response.status).toBe(429);

      const body = await response.json();
      expect(body.upgradeAvailable).toBe(false);
    });
  });

  describe('Non-Rate-Limited Endpoints', () => {
    it('should not rate limit non-API endpoints', async () => {
      const staticRequest = new NextRequest('http://localhost:3000/favicon.ico');
      const response = await middleware(staticRequest);
      
      expect(response.status).toBe(200);
      expect(mockConvexQuery).not.toHaveBeenCalled();
    });

    it('should not rate limit root page', async () => {
      const pageRequest = new NextRequest('http://localhost:3000/');
      const response = await middleware(pageRequest);
      
      expect(response.status).toBe(200);
      expect(mockConvexQuery).not.toHaveBeenCalled();
    });

    it('should not rate limit public zine pages', async () => {
      const zineRequest = new NextRequest('http://localhost:3000/zines/abc123');
      const response = await middleware(zineRequest);
      
      expect(response.status).toBe(200);
      expect(mockConvexQuery).not.toHaveBeenCalled();
    });
  });
});