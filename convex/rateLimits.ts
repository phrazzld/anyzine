import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Check rate limit for a user or IP address
 */
export const checkRateLimit = query({
  args: {
    userId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const now = Date.now();
    
    // Determine tier and limits
    const tier = args.userId ? "authenticated" : "anonymous";
    const limits = {
      anonymous: { requests: 2, window: 60 * 60 * 1000 }, // 2 per hour
      authenticated: { requests: 10, window: 24 * 60 * 60 * 1000 }, // 10 per day
    };
    
    const currentLimits = limits[tier];
    
    // Find existing rate limit record
    let rateLimitRecord;
    
    if (args.userId) {
      rateLimitRecord = await ctx.db
        .query("rateLimits")
        .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
        .filter((q: any) => q.gt(q.field("windowEnd"), now))
        .first();
    } else if (args.ipAddress) {
      rateLimitRecord = await ctx.db
        .query("rateLimits")
        .withIndex("by_ip", (q: any) => q.eq("ipAddress", args.ipAddress))
        .filter((q: any) => q.gt(q.field("windowEnd"), now))
        .first();
    } else if (args.sessionId) {
      rateLimitRecord = await ctx.db
        .query("rateLimits")
        .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
        .filter((q: any) => q.gt(q.field("windowEnd"), now))
        .first();
    }
    
    // If no record or window expired, allow request
    if (!rateLimitRecord || rateLimitRecord.windowEnd < now) {
      return {
        allowed: true,
        remaining: currentLimits.requests - 1,
        resetAt: now + currentLimits.window,
        tier,
      };
    }
    
    // Check if limit exceeded
    const remaining = rateLimitRecord.maxRequests - rateLimitRecord.requestCount;
    
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      resetAt: rateLimitRecord.windowEnd,
      tier,
    };
  },
});

/**
 * Record a rate limit hit
 */
export const recordRateLimitHit = mutation({
  args: {
    userId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const now = Date.now();
    
    // Determine tier and limits
    const tier = args.userId ? "authenticated" : "anonymous";
    const limits = {
      anonymous: { requests: 2, window: 60 * 60 * 1000 }, // 2 per hour
      authenticated: { requests: 10, window: 24 * 60 * 60 * 1000 }, // 10 per day
    };
    
    const currentLimits = limits[tier];
    
    // Find existing rate limit record
    let rateLimitRecord;
    
    if (args.userId) {
      rateLimitRecord = await ctx.db
        .query("rateLimits")
        .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
        .filter((q: any) => q.gt(q.field("windowEnd"), now))
        .first();
    } else if (args.ipAddress) {
      rateLimitRecord = await ctx.db
        .query("rateLimits")
        .withIndex("by_ip", (q: any) => q.eq("ipAddress", args.ipAddress))
        .filter((q: any) => q.gt(q.field("windowEnd"), now))
        .first();
    } else if (args.sessionId) {
      rateLimitRecord = await ctx.db
        .query("rateLimits")
        .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
        .filter((q: any) => q.gt(q.field("windowEnd"), now))
        .first();
    }
    
    if (rateLimitRecord) {
      // Update existing record
      await ctx.db.patch(rateLimitRecord._id, {
        requestCount: rateLimitRecord.requestCount + 1,
      });
    } else {
      // Create new record
      await ctx.db.insert("rateLimits", {
        userId: args.userId,
        ipAddress: args.ipAddress,
        sessionId: args.sessionId,
        requestCount: 1,
        windowStart: now,
        windowEnd: now + currentLimits.window,
        tier: tier as "anonymous" | "authenticated" | "paid",
        maxRequests: currentLimits.requests,
        windowDuration: currentLimits.window,
      });
    }
    
    return { success: true };
  },
});

/**
 * Migrate anonymous session to authenticated user
 */
export const migrateSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const now = Date.now();
    
    // Find session rate limit
    const sessionRecord = await ctx.db
      .query("rateLimits")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .filter((q: any) => q.gt(q.field("windowEnd"), now))
      .first();
    
    if (!sessionRecord) {
      return { migrated: false, message: "No active session found" };
    }
    
    // Find user rate limit
    const userRecord = await ctx.db
      .query("rateLimits")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .filter((q: any) => q.gt(q.field("windowEnd"), now))
      .first();
    
    if (userRecord) {
      // Merge session count into user record (be generous)
      const newCount = Math.max(userRecord.requestCount, sessionRecord.requestCount);
      
      await ctx.db.patch(userRecord._id, {
        requestCount: newCount,
      });
      
      // Mark session as migrated
      await ctx.db.patch(sessionRecord._id, {
        migratedToUserId: args.userId,
        migratedAt: now,
      });
    } else {
      // Convert session record to user record
      await ctx.db.patch(sessionRecord._id, {
        userId: args.userId,
        sessionId: undefined,
        tier: "authenticated" as const,
        maxRequests: 10,
        windowDuration: 24 * 60 * 60 * 1000,
        windowEnd: now + 24 * 60 * 60 * 1000,
        migratedAt: now,
      });
    }
    
    return { migrated: true, message: "Session migrated successfully" };
  },
});

/**
 * Clean up expired rate limit records
 */
export const cleanupExpiredRecords = mutation({
  args: {},
  handler: async (ctx: any) => {
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000; // 24 hours ago
    
    // Find expired records
    const expired = await ctx.db
      .query("rateLimits")
      .withIndex("by_window_end")
      .filter((q: any) => q.lt(q.field("windowEnd"), cutoff))
      .collect();
    
    // Delete expired records
    for (const record of expired) {
      await ctx.db.delete(record._id);
    }
    
    return { deleted: expired.length };
  },
});