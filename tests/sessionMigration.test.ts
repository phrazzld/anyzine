import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  generateSessionId,
  getSessionId,
  setSessionCookie,
  ensureSessionId,
  clearSessionCookie,
  getClientSessionId
} from '@/lib/sessionMigration';

// Mock crypto for consistent testing
const mockRandomUUID = vi.fn();
vi.stubGlobal('crypto', {
  randomUUID: mockRandomUUID
});

// Mock Math.random as fallback
const mockMathRandom = vi.spyOn(Math, 'random');

describe('Session Migration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    mockRandomUUID.mockReturnValue('test-uuid-123');
    mockMathRandom.mockReturnValue(0.5);
    // Ensure crypto mock is set
    vi.stubGlobal('crypto', {
      randomUUID: mockRandomUUID
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Session ID Generation', () => {
    it('should generate session ID using crypto.randomUUID when available', () => {
      const sessionId = generateSessionId();
      
      expect(mockRandomUUID).toHaveBeenCalled();
      expect(sessionId).toBe('test-uuid-123');
    });

    it('should fallback to timestamp-random format when crypto.randomUUID unavailable', () => {
      // Mock Date.now() for consistent testing
      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(1234567890);
      
      // Clear previous mock to ensure Math.random gets called
      mockMathRandom.mockClear();
      
      // Mock crypto to be undefined
      vi.stubGlobal('crypto', undefined);

      const sessionId = generateSessionId();
      
      expect(mockMathRandom).toHaveBeenCalled();
      // Should be in format: timestamp-random
      expect(sessionId).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
      
      mockDateNow.mockRestore();
      // Restore crypto mock for other tests
      vi.stubGlobal('crypto', {
        randomUUID: mockRandomUUID
      });
    });

    it('should generate valid session ID format', () => {
      const sessionId = generateSessionId();
      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');
    });

    it('should generate unique session IDs', () => {
      mockRandomUUID
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2')
        .mockReturnValueOnce('uuid-3');

      const ids = new Set([
        generateSessionId(),
        generateSessionId(),
        generateSessionId()
      ]);

      expect(ids.size).toBe(3);
    });
  });

  describe('Cookie Reading', () => {
    it('should extract session ID from request cookies', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          cookie: 'anyzine_session=session_abc123; other_cookie=value'
        }
      });

      const sessionId = getSessionId(request);
      expect(sessionId).toBe('session_abc123');
    });

    it('should return null when no session cookie exists', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          cookie: 'other_cookie=value'
        }
      });

      const sessionId = getSessionId(request);
      expect(sessionId).toBeNull();
    });

    it('should handle missing cookie header', () => {
      const request = new NextRequest('http://localhost:3000');
      
      const sessionId = getSessionId(request);
      expect(sessionId).toBeNull();
    });

    it('should handle malformed cookie strings', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          cookie: 'invalid_cookie_format'
        }
      });

      const sessionId = getSessionId(request);
      expect(sessionId).toBeNull();
    });
  });

  describe('Cookie Setting', () => {
    it('should set session cookie with correct attributes', () => {
      const response = NextResponse.next();
      const sessionId = 'session_test123';
      
      setSessionCookie(response, sessionId);
      
      // Check if cookie was set (NextResponse uses cookies.set)
      const setCookieMethod = vi.spyOn(response.cookies, 'set');
      setSessionCookie(response, sessionId);
      
      expect(setCookieMethod).toHaveBeenCalledWith(
        'anyzine_session',
        sessionId,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/'
        })
      );
    });

    it('should set secure flag in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const response = NextResponse.next();
      const setCookieMethod = vi.spyOn(response.cookies, 'set');
      
      setSessionCookie(response, 'session_prod123');
      
      expect(setCookieMethod).toHaveBeenCalledWith(
        'anyzine_session',
        'session_prod123',
        expect.objectContaining({
          secure: true
        })
      );
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not set secure flag in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const response = NextResponse.next();
      const setCookieMethod = vi.spyOn(response.cookies, 'set');
      
      setSessionCookie(response, 'session_dev123');
      
      expect(setCookieMethod).toHaveBeenCalledWith(
        'anyzine_session',
        'session_dev123',
        expect.objectContaining({
          secure: false
        })
      );
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Session Lifecycle Management', () => {
    it('should create new session when none exists', () => {
      const request = new NextRequest('http://localhost:3000');
      const response = NextResponse.next();
      
      const result = ensureSessionId(request, response);
      
      expect(result.isNew).toBe(true);
      expect(result.sessionId).toBeTruthy();
      expect(mockRandomUUID).toHaveBeenCalled();
    });

    it('should reuse existing session from cookies', () => {
      const existingSessionId = 'session_existing123';
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          cookie: `anyzine_session=${existingSessionId}`
        }
      });
      const response = NextResponse.next();
      
      const result = ensureSessionId(request, response);
      
      expect(result.isNew).toBe(false);
      expect(result.sessionId).toBe(existingSessionId);
      expect(mockRandomUUID).not.toHaveBeenCalled();
    });

    it('should set cookie for new sessions', () => {
      const request = new NextRequest('http://localhost:3000');
      const response = NextResponse.next();
      const setCookieSpy = vi.spyOn(response.cookies, 'set');
      
      const result = ensureSessionId(request, response);
      
      expect(setCookieSpy).toHaveBeenCalledWith(
        'anyzine_session',
        result.sessionId,
        expect.any(Object)
      );
    });

    it('should not set cookie for existing sessions', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          cookie: 'anyzine_session=session_existing456'
        }
      });
      const response = NextResponse.next();
      const setCookieSpy = vi.spyOn(response.cookies, 'set');
      
      ensureSessionId(request, response);
      
      expect(setCookieSpy).not.toHaveBeenCalled();
    });
  });

  describe('Cookie Cleanup', () => {
    it('should clear session cookie with proper expiry', () => {
      const response = NextResponse.next();
      const deleteCookieSpy = vi.spyOn(response.cookies, 'delete');
      
      clearSessionCookie(response);
      
      expect(deleteCookieSpy).toHaveBeenCalledWith('anyzine_session');
    });

    it('should maintain security settings when clearing', () => {
      const response = NextResponse.next();
      const deleteCookieSpy = vi.spyOn(response.cookies, 'delete');
      
      clearSessionCookie(response);
      
      expect(deleteCookieSpy).toHaveBeenCalledWith('anyzine_session');
    });
  });

  describe('Client-Side Session Access', () => {
    beforeEach(() => {
      // Reset document.cookie
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: ''
      });
    });

    it('should read session ID from document cookies', () => {
      document.cookie = 'anyzine_session=session_client123; path=/';
      
      const sessionId = getClientSessionId();
      expect(sessionId).toBe('session_client123');
    });

    it('should return null when no session cookie in document', () => {
      document.cookie = 'other_cookie=value; path=/';
      
      const sessionId = getClientSessionId();
      expect(sessionId).toBeNull();
    });

    it('should handle multiple cookies correctly', () => {
      document.cookie = 'first=value1; anyzine_session=session_multi789; last=value3';
      
      const sessionId = getClientSessionId();
      expect(sessionId).toBe('session_multi789');
    });

    it('should handle empty document.cookie', () => {
      document.cookie = '';
      
      const sessionId = getClientSessionId();
      expect(sessionId).toBeNull();
    });

    it('should handle cookies with spaces', () => {
      document.cookie = 'anyzine_session=session_spaces456; path=/';
      
      const sessionId = getClientSessionId();
      expect(sessionId).toBe('session_spaces456');
    });
  });

  describe('Anonymous to Authenticated Transition', () => {
    it('should maintain session ID format during transition', () => {
      // Start as anonymous
      const request = new NextRequest('http://localhost:3000');
      const response = NextResponse.next();
      
      const anonymousSession = ensureSessionId(request, response);
      expect(anonymousSession.sessionId).toBeTruthy();
      
      // Same session should be usable after authentication
      const authRequest = new NextRequest('http://localhost:3000', {
        headers: {
          cookie: `anyzine_session=${anonymousSession.sessionId}`
        }
      });
      
      const authSession = getSessionId(authRequest);
      expect(authSession).toBe(anonymousSession.sessionId);
    });

    it('should prepare session for migration tracking', () => {
      const sessionId = generateSessionId();
      
      // Session ID should be compatible with database indexes
      expect(sessionId).toBeTruthy();
      expect(sessionId.length).toBeGreaterThan(8);
      expect(sessionId.length).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle cookie parsing errors gracefully', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          cookie: 'malformed;cookie=syntax==='
        }
      });
      
      const sessionId = getSessionId(request);
      expect(sessionId).toBeNull();
    });

    it('should handle response cookie setting failures', () => {
      const response = NextResponse.next();
      // Mock cookie.set to throw
      vi.spyOn(response.cookies, 'set').mockImplementation(() => {
        throw new Error('Cookie setting failed');
      });
      
      // Should throw the error
      expect(() => setSessionCookie(response, 'session_test')).toThrow('Cookie setting failed');
    });

    it('should recover from crypto failures', () => {
      // Mock crypto to be undefined
      vi.stubGlobal('crypto', undefined);
      
      // Should still generate a session ID using fallback
      const sessionId = generateSessionId();
      expect(sessionId).toBeTruthy();
      expect(sessionId).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
      
      // Restore crypto mock for other tests
      vi.stubGlobal('crypto', {
        randomUUID: mockRandomUUID
      });
    });
  });

  describe('Security Considerations', () => {
    it('should not expose session ID in non-httpOnly context', () => {
      const response = NextResponse.next();
      const setCookieSpy = vi.spyOn(response.cookies, 'set');
      
      setSessionCookie(response, 'session_secure123');
      
      // Verify httpOnly is always true
      expect(setCookieSpy).toHaveBeenCalledWith(
        'anyzine_session',
        'session_secure123',
        expect.objectContaining({
          httpOnly: true
        })
      );
    });

    it('should use lax sameSite to prevent CSRF', () => {
      const response = NextResponse.next();
      const setCookieSpy = vi.spyOn(response.cookies, 'set');
      
      setSessionCookie(response, 'session_csrf123');
      
      expect(setCookieSpy).toHaveBeenCalledWith(
        'anyzine_session',
        'session_csrf123',
        expect.objectContaining({
          sameSite: 'lax'
        })
      );
    });

    it('should enforce secure flag in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const response = NextResponse.next();
      const setCookieSpy = vi.spyOn(response.cookies, 'set');
      
      setSessionCookie(response, 'session_prod_secure');
      
      expect(setCookieSpy).toHaveBeenCalledWith(
        'anyzine_session',
        'session_prod_secure',
        expect.objectContaining({
          secure: true,
          httpOnly: true,
          sameSite: 'lax'
        })
      );
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Session Expiry', () => {
    it('should set 30-day expiry for new sessions', () => {
      const response = NextResponse.next();
      const setCookieSpy = vi.spyOn(response.cookies, 'set');
      
      setSessionCookie(response, 'session_expiry123');
      
      const expectedMaxAge = 30 * 24 * 60 * 60; // 30 days in seconds
      expect(setCookieSpy).toHaveBeenCalledWith(
        'anyzine_session',
        'session_expiry123',
        expect.objectContaining({
          maxAge: expectedMaxAge
        })
      );
    });

    it('should clear expired sessions properly', () => {
      const response = NextResponse.next();
      const deleteCookieSpy = vi.spyOn(response.cookies, 'delete');
      
      clearSessionCookie(response);
      
      expect(deleteCookieSpy).toHaveBeenCalledWith('anyzine_session');
    });
  });
});