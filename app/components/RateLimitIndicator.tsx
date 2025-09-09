"use client";

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getClientSessionId } from '@/lib/sessionMigration';
import { useEffect, useState } from 'react';

export function RateLimitIndicator() {
  const { user } = useUser();
  const [hasTimedOut, setHasTimedOut] = useState(false);
  
  // Get session ID for anonymous users
  const sessionId = !user ? getClientSessionId() : null;
  
  // Fetch real rate limit data from Convex with proper typed API
  const rateLimitData = useQuery(api.rateLimits.checkRateLimit, {
    userId: user?.id || undefined,
    sessionId: sessionId || undefined,
  });
  
  // Implement timeout for graceful degradation (3 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (rateLimitData === undefined) {
        setHasTimedOut(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [rateLimitData]);
  
  // If we've timed out or there's an error, hide the indicator (graceful degradation)
  if (hasTimedOut || rateLimitData === null) {
    return null; // Don't block the UI - let users use the app
  }
  
  // Loading state - show briefly
  if (rateLimitData === undefined) {
    return (
      <div className="bg-gray-300 border-gray-500 border-4 p-4 mb-6 animate-pulse">
        <div className="text-gray-600 font-bold uppercase text-sm">
          Loading rate limits...
        </div>
      </div>
    );
  }
  
  // Determine tier display info
  const tier = rateLimitData.tier as 'anonymous' | 'authenticated';
  const limits = {
    anonymous: { limit: 2, window: 'hour' },
    authenticated: { limit: 10, window: 'day' }
  };
  
  const rateLimitInfo = {
    tier,
    limit: limits[tier].limit,
    remaining: rateLimitData.remaining,
    resetAt: limits[tier].window,
  };
  
  if (!rateLimitInfo) return null;
  
  // Determine colors based on tier and remaining count
  const isLow = rateLimitInfo.remaining <= 1;
  const bgColor = isLow ? 'bg-orange-400' : (rateLimitInfo.tier === 'authenticated' ? 'bg-green-400' : 'bg-yellow-400');
  const borderColor = isLow ? 'border-orange-600' : (rateLimitInfo.tier === 'authenticated' ? 'border-green-600' : 'border-yellow-600');
  
  return (
    <div className={`${bgColor} ${borderColor} border-4 p-4 mb-6`}>
      <div className="text-black font-bold uppercase text-sm">
        Rate Limit Status
      </div>
      <div className="mt-2 space-y-1">
        <div className="text-black text-xs font-mono">
          TIER: {rateLimitInfo.tier.toUpperCase()}
        </div>
        <div className="text-black text-xs font-mono">
          REMAINING: {rateLimitInfo.remaining} / {rateLimitInfo.limit}
        </div>
        <div className="text-black text-xs font-mono">
          RESETS: EVERY {rateLimitInfo.resetAt.toUpperCase()}
        </div>
        {isLow && (
          <div className="mt-2 text-black text-xs font-bold">
            ⚠️ RATE LIMIT ALMOST REACHED!
          </div>
        )}
        {rateLimitInfo.tier === 'anonymous' && (
          <div className="mt-2 text-black text-xs font-bold">
            💡 SIGN IN FOR 10 ZINES/DAY!
          </div>
        )}
      </div>
    </div>
  );
}