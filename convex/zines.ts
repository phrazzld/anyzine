import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * Generate a short public ID for zine URLs
 */
function generatePublicId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a new zine and store it in the database
 */
export const createZine = mutation({
  args: {
    subject: v.string(),
    banner: v.string(),
    subheading: v.string(),
    intro: v.string(),
    mainArticle: v.string(),
    opinion: v.string(),
    funFacts: v.array(v.string()),
    conclusion: v.string(),
    generatedBy: v.optional(v.string()),
    generatedByIp: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    // Generate a unique public ID
    let publicId = generatePublicId();
    let attempts = 0;
    
    // Ensure uniqueness (very unlikely to collide but just in case)
    while (attempts < 10) {
      const existing = await ctx.db
        .query("zines")
        .withIndex("by_public_id", (q: any) => q.eq("publicId", publicId))
        .first();
      
      if (!existing) break;
      
      publicId = generatePublicId();
      attempts++;
    }
    
    // Create the zine
    const zineId = await ctx.db.insert("zines", {
      ...args,
      publicId,
      createdAt: Date.now(),
      isPublic: true, // All zines are public in MVP
      viewCount: 0,
      shareCount: 0,
    });
    
    return {
      id: zineId,
      publicId,
    };
  },
});

/**
 * Get a zine by its public ID
 */
export const getZineByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx: any, args: any) => {
    const zine = await ctx.db
      .query("zines")
      .withIndex("by_public_id", (q: any) => q.eq("publicId", args.publicId))
      .first();
    
    if (zine) {
      // Increment view count (fire and forget)
      ctx.db.patch(zine._id, { viewCount: (zine.viewCount || 0) + 1 });
    }
    
    return zine;
  },
});

/**
 * Get recent public zines
 */
export const getRecentZines = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const limit = args.limit || 10;
    
    const zines = await ctx.db
      .query("zines")
      .withIndex("by_creation")
      .order("desc")
      .take(limit);
    
    return zines;
  },
});

/**
 * Get zines created by a specific user
 */
export const getUserZines = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const limit = args.limit || 20;
    
    const zines = await ctx.db
      .query("zines")
      .withIndex("by_user", (q: any) => q.eq("generatedBy", args.userId))
      .order("desc")
      .take(limit);
    
    return zines;
  },
});

/**
 * Search zines by subject
 */
export const searchZinesBySubject = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const limit = args.limit || 20;
    
    // Simple subject search (case-insensitive)
    const allZines = await ctx.db
      .query("zines")
      .withIndex("by_subject")
      .collect();
    
    const filtered = allZines
      .filter((zine: any) => 
        zine.subject.toLowerCase().includes(args.searchTerm.toLowerCase())
      )
      .slice(0, limit);
    
    return filtered;
  },
});

/**
 * Increment share count for a zine
 */
export const incrementShareCount = mutation({
  args: { publicId: v.string() },
  handler: async (ctx: any, args: any) => {
    const zine = await ctx.db
      .query("zines")
      .withIndex("by_public_id", (q: any) => q.eq("publicId", args.publicId))
      .first();
    
    if (zine) {
      await ctx.db.patch(zine._id, {
        shareCount: (zine.shareCount || 0) + 1,
      });
    }
  },
});