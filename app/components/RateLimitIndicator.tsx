"use client";

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

interface RateLimitInfo {
  tier: 'anonymous' | 'authenticated';
  remaining: number;
  limit: number;
  resetAt: string;
}

export function RateLimitIndicator() {
  const { user } = useUser();
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  
  // For now, show static info based on auth status
  // In a production app, this would fetch from an API
  useEffect(() => {
    const tier = user ? 'authenticated' : 'anonymous';
    const limits = {
      anonymous: { limit: 2, window: 'hour' },
      authenticated: { limit: 10, window: 'day' }
    };
    
    setRateLimitInfo({
      tier,
      limit: limits[tier].limit,
      remaining: limits[tier].limit, // This would come from actual API
      resetAt: limits[tier].window,
    });
  }, [user]);
  
  if (!rateLimitInfo) return null;
  
  const bgColor = rateLimitInfo.tier === 'authenticated' ? 'bg-green-400' : 'bg-yellow-400';
  const borderColor = rateLimitInfo.tier === 'authenticated' ? 'border-green-600' : 'border-yellow-600';
  
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
          LIMIT: {rateLimitInfo.limit} ZINES PER {rateLimitInfo.resetAt.toUpperCase()}
        </div>
        {rateLimitInfo.tier === 'anonymous' && (
          <div className="mt-2 text-black text-xs font-bold">
            💡 SIGN IN FOR 10 ZINES/DAY!
          </div>
        )}
      </div>
    </div>
  );
}