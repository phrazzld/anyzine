/**
 * @fileoverview Custom React hook for fetching and tracking rate limit status
 * Provides real-time rate limit data from Convex with authentication awareness
 */

"use client";

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getClientSessionId } from '@/lib/sessionMigration';

/**
 * Rate limit data structure from Convex
 */
interface RateLimitData {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  tier: 'anonymous' | 'authenticated';
}

/**
 * Hook return type
 */
interface UseRateLimitReturn {
  rateLimitData: RateLimitData | undefined | null;
  isLoading: boolean;
  hasError: boolean;
  isAuthenticated: boolean;
  userTier: 'anonymous' | 'authenticated';
  remaining: number | null;
  allowed: boolean | null;
  resetAt: number | null;
  tier: string | null;
  limit: number;
  windowDescription: string;
  percentageUsed: number;
  isNearLimit: boolean;
  timeUntilReset: number | null;
}

/**
 * Hook for fetching and tracking real-time rate limit status
 * 
 * @description Provides complete rate limit information with real-time updates:
 * - Fetches current rate limit status from Convex database
 * - Handles both authenticated and anonymous users
 * - Tracks remaining generations in current window
 * - Provides reset time and tier information
 * - Automatically updates when rate limit changes
 * 
 * @returns {object} Hook interface with rate limit data and state
 * @returns {RateLimitData|undefined|null} returns.rateLimitData - Raw rate limit data from Convex
 * @returns {boolean} returns.isLoading - True while fetching data
 * @returns {boolean} returns.hasError - True if fetch failed
 * @returns {boolean} returns.isAuthenticated - Whether user is authenticated
 * @returns {string} returns.userTier - User tier ('authenticated' or 'anonymous')
 * @returns {number|null} returns.remaining - Remaining requests in current window
 * @returns {boolean|null} returns.allowed - Whether next request is allowed
 * @returns {number|null} returns.resetAt - Unix timestamp when limit resets
 * @returns {string|null} returns.tier - Current rate limit tier
 * @returns {number} returns.limit - Max requests for current tier
 * @returns {string} returns.windowDescription - Human-readable window description
 * 
 * @example
 * ```tsx
 * const { remaining, allowed, isLoading, resetAt } = useRateLimit();
 * 
 * if (isLoading) return <div>Loading rate limits...</div>;
 * if (!allowed) return <div>Rate limit exceeded. Resets at {new Date(resetAt)}</div>;
 * return <div>Remaining: {remaining}</div>;
 * ```
 * 
 * @sideEffects
 * - Establishes WebSocket connection to Convex for real-time updates
 * - Re-fetches data when authentication state changes
 * - Re-fetches data when session ID changes
 */
export const useRateLimit = (): UseRateLimitReturn => {
  const { user } = useUser();
  
  // Get session ID for anonymous users
  const sessionId = !user ? getClientSessionId() : null;
  
  // Fetch rate limit data from Convex with real-time updates
  const rateLimitData = useQuery(api.rateLimits.checkRateLimit, {
    userId: user?.id || undefined,
    sessionId: sessionId || undefined,
  }) as RateLimitData | undefined | null;
  
  // Determine tier-specific limits for display
  const tierLimits = {
    anonymous: { limit: 2, window: 'hour' },
    authenticated: { limit: 10, window: 'day' }
  };
  
  const currentTier = user ? 'authenticated' : 'anonymous';
  const currentLimits = tierLimits[currentTier];
  
  return {
    // Raw data
    rateLimitData,
    
    // Loading and error states
    isLoading: rateLimitData === undefined,
    hasError: rateLimitData === null,
    
    // Authentication info
    isAuthenticated: !!user,
    userTier: currentTier,
    
    // Extracted rate limit values (null when loading or error)
    remaining: rateLimitData?.remaining ?? null,
    allowed: rateLimitData?.allowed ?? null,
    resetAt: rateLimitData?.resetAt ?? null,
    tier: rateLimitData?.tier ?? null,
    
    // Additional computed values
    limit: currentLimits.limit,
    windowDescription: currentLimits.window,
    
    // Utility calculations
    percentageUsed: rateLimitData 
      ? Math.round(((currentLimits.limit - rateLimitData.remaining) / currentLimits.limit) * 100)
      : 0,
    isNearLimit: rateLimitData?.remaining ? rateLimitData.remaining <= 1 : false,
    timeUntilReset: rateLimitData?.resetAt 
      ? Math.max(0, rateLimitData.resetAt - Date.now())
      : null,
  };
};

/**
 * Format time until reset in human-readable format
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time string
 */
export const formatTimeUntilReset = (milliseconds: number | null): string => {
  if (!milliseconds) return '';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
};