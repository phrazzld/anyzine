import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Zines table - stores all generated zines (public by default)
  zines: defineTable({
    // Core content
    subject: v.string(),
    banner: v.string(),
    subheading: v.string(),
    intro: v.string(),
    mainArticle: v.string(),
    opinion: v.string(),
    funFacts: v.array(v.string()),
    conclusion: v.string(),
    
    // Metadata
    createdAt: v.number(), // Unix timestamp
    generatedBy: v.optional(v.string()), // Clerk user ID for authenticated users
    generatedByIp: v.optional(v.string()), // IP address for anonymous users
    
    // Public access
    isPublic: v.boolean(), // Always true for MVP
    publicId: v.string(), // Short ID for public URLs
    
    // Analytics (future use)
    viewCount: v.optional(v.number()),
    shareCount: v.optional(v.number()),
  })
    .index("by_creation", ["createdAt"])
    .index("by_user", ["generatedBy"])
    .index("by_public_id", ["publicId"])
    .index("by_subject", ["subject"]),
  
  // Rate limits table - tracks usage for both anonymous and authenticated users
  rateLimits: defineTable({
    // Identification
    userId: v.optional(v.string()), // Clerk user ID for authenticated
    ipAddress: v.optional(v.string()), // IP for anonymous users
    sessionId: v.optional(v.string()), // Temporary session for migration
    
    // Rate limit tracking
    requestCount: v.number(),
    windowStart: v.number(), // Unix timestamp
    windowEnd: v.number(), // Unix timestamp
    tier: v.union(v.literal("anonymous"), v.literal("authenticated"), v.literal("paid")),
    
    // Limits
    maxRequests: v.number(), // 2 for anonymous, 10 for authenticated
    windowDuration: v.number(), // In milliseconds (1 hour or 24 hours)
    
    // Migration support
    migratedToUserId: v.optional(v.string()), // If session was migrated
    migratedAt: v.optional(v.number()), // When migration happened
  })
    .index("by_user", ["userId"])
    .index("by_ip", ["ipAddress"])
    .index("by_session", ["sessionId"])
    .index("by_window_end", ["windowEnd"]), // For cleanup
  
  // User preferences (future expansion)
  userPreferences: defineTable({
    userId: v.string(), // Clerk user ID
    favoriteSubjects: v.optional(v.array(v.string())),
    emailNotifications: v.optional(v.boolean()),
    theme: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),
});