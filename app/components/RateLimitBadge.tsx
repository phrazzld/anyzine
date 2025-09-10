"use client";

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getClientSessionId } from '@/lib/sessionMigration';
import { useEffect, useState } from 'react';

export function RateLimitBadge() {
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
  
  // Loading state - show subtle skeleton
  if (rateLimitData === undefined) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border-2 border-gray-300 animate-pulse">
        <div className="w-20 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  // Determine tier display info
  const tier = rateLimitData.tier as 'anonymous' | 'authenticated';
  const limits = {
    anonymous: { limit: 2, window: 'hour' },
    authenticated: { limit: 10, window: 'day' }
  };
  
  const remaining = rateLimitData.remaining;
  const limit = limits[tier].limit;
  const isLow = remaining <= 1;
  const isAuthenticated = tier === 'authenticated';
  
  // Determine styling based on state
  const bgColor = isLow ? 'bg-red-100' : (isAuthenticated ? 'bg-green-100' : 'bg-yellow-100');
  const borderColor = isLow ? 'border-red-500' : (isAuthenticated ? 'border-green-500' : 'border-yellow-500');
  const textColor = isLow ? 'text-red-900' : (isAuthenticated ? 'text-green-900' : 'text-yellow-900');
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 ${bgColor} border-2 ${borderColor} transition-all`}>
      {/* Rate limit display */}
      <div className={`flex items-center gap-1 ${textColor}`}>
        <span className="font-mono text-sm font-bold">{remaining}/{limit}</span>
        <span className="text-xs font-bold uppercase">per {limits[tier].window}</span>
      </div>
      
      {/* Status indicators */}
      {isLow && (
        <span className="text-red-600 font-bold text-xs animate-pulse">⚠️</span>
      )}
      
      {!isAuthenticated && (
        <div className="hidden md:flex items-center gap-1 pl-2 border-l-2 border-current">
          <span className="text-xs font-medium">Sign in for more</span>
        </div>
      )}
    </div>
  );
}