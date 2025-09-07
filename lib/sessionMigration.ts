/**
 * Session migration utilities for tracking anonymous users and migrating to authenticated
 */

import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'anyzine_session';
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * Generate a unique session ID for anonymous users
 */
export function generateSessionId(): string {
  // Use crypto API if available (server-side)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older environments
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}

/**
 * Get session ID from request cookies
 */
export function getSessionId(request: NextRequest): string | null {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  return cookie?.value || null;
}

/**
 * Set session cookie in response
 */
export function setSessionCookie(response: NextResponse, sessionId: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Get or create session ID for a request
 * Returns the session ID and whether a new one was created
 */
export function ensureSessionId(
  request: NextRequest,
  response: NextResponse
): { sessionId: string; isNew: boolean } {
  let sessionId = getSessionId(request);
  let isNew = false;
  
  if (!sessionId) {
    sessionId = generateSessionId();
    setSessionCookie(response, sessionId);
    isNew = true;
  }
  
  return { sessionId, isNew };
}

/**
 * Clear session cookie after successful migration
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME);
}

/**
 * Get session cookie from client-side (for migration trigger)
 */
export function getClientSessionId(): string | null {
  if (typeof document === 'undefined') return null;
  
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${SESSION_COOKIE_NAME}=`));
  
  return match ? match.split('=')[1] : null;
}