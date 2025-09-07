# AnyZine Authentication & Database Implementation TODO

Updated: 2025-09-07

## ✅ COMPLETED TASKS

### Authentication & Database Foundation
- [x] **CONVEX-001** - Initialize Convex project structure
  - ✅ Created `convex/schema.ts`, `convex/zines.ts`, `convex/rateLimits.ts`
  - ✅ Convex configuration files in place
  
- [x] **AUTH-001** - Install and configure Clerk authentication
  - ✅ Installed `@clerk/nextjs` package
  - ✅ Configured ClerkProvider in `app/layout.tsx`
  - ✅ Added Clerk API keys to `.env.local`

- [x] **SCHEMA-001** - Design zine storage schema
  - ✅ Created comprehensive schema in `convex/schema.ts`
  - ✅ Includes zines, rateLimits, and userPreferences tables

- [x] **SCHEMA-002** - Design rate limiting database schema
  - ✅ Rate limits table with user/IP/session tracking
  - ✅ Migration support fields included

- [x] **FUNC-001** - Create zine storage functions
  - ✅ `createZine`, `getZineByPublicId`, `getRecentZines` in `convex/zines.ts`
  - ✅ Public ID generation for URLs

- [x] **FUNC-002** - Create rate limiting Convex functions
  - ✅ `checkRateLimit`, `recordRateLimitHit`, `migrateSession` in `convex/rateLimits.ts`
  - ⚠️ BUT: Not connected to middleware yet!

- [x] **API-001** - Enhance generate-zine endpoint with persistence
  - ✅ API saves zines to Convex database
  - ✅ Returns public URLs (`/zines/[publicId]`)
  - ✅ Associates zines with authenticated users

- [x] **AUTH-002** - Configure magic link authentication
  - ✅ Clerk configured for magic links (primary)

- [x] **AUTH-003** - Configure Google OAuth
  - ✅ Google OAuth available as secondary option

- [x] **UI-001** - Style Clerk authentication components
  - ✅ Created `AuthButton.tsx` with neobrutalist styling

- [x] **COMP-001** - Add authentication to SubjectForm component
  - ✅ AuthButton integrated into main page
  - ✅ RateLimitIndicator added to form

- [x] **COMP-002** - Create public zine display page
  - ✅ Created `/zines/[id]/page.tsx`
  - ✅ Share buttons (Twitter/X, copy link)

- [x] **UI-002** - Add rate limit indicator component
  - ✅ Created `RateLimitIndicator.tsx`
  - ⚠️ BUT: Shows static data, not real limits

- [x] **MIDDLEWARE-001** - Enhance existing rate limiting middleware
  - ✅ Added tiered rate limits (2/hour anonymous, 10/day authenticated)
  - ✅ Clerk authentication integration
  - ⚠️ BUT: Still uses in-memory storage, NOT Convex database!

## 🔴 CRITICAL GAPS (Must Fix)

### Database Integration Issues
- [x] **CRITICAL-001** - Connect rate limiting to Convex database
  - Current: Middleware uses in-memory Map storage
  - Needed: Call Convex `checkRateLimit` and `recordRateLimitHit` functions
  - Files: `middleware.ts`
  - Why critical: Rate limits reset on server restart, not persistent
  ```
  Work Log:
  - Imported ConvexHttpClient and created getConvexClient() function
  - Modified applyRateLimit() to be async and use Convex functions
  - Implemented try/catch with fallback to in-memory storage if Convex fails
  - Updated environment variable names to match actual .env.local values
  - Preserved original in-memory logic as fallback for resilience
  - Build succeeds and TypeScript compilation passes
  ```

- [ ] **CRITICAL-002** - Implement actual session migration
  - Current: No session migration in middleware
  - Needed: Track anonymous sessions and migrate on auth
  - Files: `middleware.ts`, create `lib/sessionMigration.ts`
  - Why critical: Core feature not implemented

- [ ] **CRITICAL-003** - Fix RateLimitIndicator to show real data
  - Current: Shows static tier info
  - Needed: Fetch actual rate limit status from API/Convex
  - Files: `app/components/RateLimitIndicator.tsx`
  - Why critical: Users see fake data

## 🟡 IMPORTANT REMAINING TASKS

### Integration & Hooks
- [ ] **HOOK-001** - Enhance useZineGeneration hook for authentication
  - Add public URL handling
  - Show auth-aware messages
  - Files: `app/hooks/useZineGeneration.ts`

- [ ] **HOOK-002** - Create useRateLimit hook
  - Fetch real rate limit status
  - Track remaining generations
  - Files: Create `app/hooks/useRateLimit.ts`

### Convex Deployment
- [ ] **CONVEX-002** - Run Convex deployment
  - Run `npx convex dev` to sync schema
  - Verify functions deploy correctly
  - Test database operations

### API Improvements
- [ ] **API-002** - Create public zine access endpoint (optional)
  - Current: Page directly queries Convex
  - Consider: Dedicated API endpoint for caching

## 🧪 TESTING (Currently Missing)

### Critical Tests Needed
- [ ] **TEST-001** - Test Convex functions
  - No tests exist for `convex/zines.ts` or `convex/rateLimits.ts`
  - Files: Create `convex/zines.test.ts`, `convex/rateLimits.test.ts`

- [ ] **TEST-002** - Test authentication flow
  - No tests for Clerk integration
  - Files: Create `tests/integration/auth.test.ts`

- [ ] **TEST-003** - Test rate limiting
  - No tests for tiered limits or fallback
  - Files: Create `tests/integration/rateLimits.test.ts`

- [ ] **TEST-004** - Test session migration
  - No tests for anonymous→authenticated transition
  - Files: Create `tests/sessionMigration.test.ts`

## 📚 DOCUMENTATION

- [ ] **DOC-001** - Update README
  - Add Clerk setup instructions
  - Add Convex deployment steps
  - Document environment variables

- [ ] **DOC-002** - Document API changes
  - Document public URL responses
  - Document rate limit headers
  - Files: Create `docs/API.md`

## 🚫 ACTUAL vs PLANNED State

### What's Actually Working:
✅ Zines save to Convex database
✅ Public URLs work (`/zines/[id]`)
✅ Clerk authentication UI works
✅ Build compiles successfully

### What's NOT Actually Working:
❌ Rate limiting still uses in-memory storage (not Convex)
❌ Session migration not implemented
❌ Rate limit indicator shows fake data
❌ No actual database rate limit tracking
❌ No tests for new features

## 📋 Corrected Implementation Priority

### Phase 1: Fix Critical Gaps (Do First!)
1. Connect middleware rate limiting to Convex database
2. Implement real session migration
3. Make RateLimitIndicator fetch real data
4. Run `npx convex dev` to deploy functions

### Phase 2: Complete Integration
5. Create useRateLimit hook
6. Enhance useZineGeneration for auth
7. Test end-to-end flow

### Phase 3: Testing & Documentation
8. Write tests for Convex functions
9. Write integration tests
10. Update documentation

## 🎯 Acceptance Criteria (Current Status)

### Working Now:
- [x] Zines save to database with public URLs
- [x] Authentication UI present
- [x] Build passes

### NOT Working Yet:
- [ ] Rate limits persist across server restarts
- [ ] Anonymous usage transfers to authenticated
- [ ] Rate limit indicator shows real remaining count
- [ ] Database actually tracks rate limits
- [ ] Session migration works

## 🔧 Quick Fix List

```bash
# To make it actually work:
1. Update middleware.ts to call Convex rate limit functions
2. Create API endpoint for rate limit status
3. Update RateLimitIndicator to fetch real data
4. Run: npx convex dev
5. Test the actual flow
```

## 📝 Notes

The implementation is about **60% complete**. The UI is all there, but the backend integration between the middleware and Convex database is missing. The rate limiting is still using the old in-memory system, not the new Convex functions we created.

Key insight: We built all the pieces but didn't connect them together!