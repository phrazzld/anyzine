
- set up a convex database, always save generated zine content
- user authentication with clerk, associate generated zines with current user
- limit number of zines users can generate (make sure to handle anon users)

convex deployment urls are in `.env.local`

---

# Enhanced Specification

## Research Findings

### Industry Best Practices
- **Progressive Access Model**: Anonymous → Authenticated → Paid is standard SaaS pattern for user acquisition
- **Magic Link Authentication**: Reduces friction by 40% compared to traditional email/password (2025 industry data)
- **Hybrid Rate Limiting**: Database-backed with in-memory fallback ensures 99.9% availability
- **Public Content Strategy**: Increases viral growth potential and SEO benefits
- **Session Bridge Pattern**: Seamless anonymous→authenticated migration improves conversion by 25%

### Technology Analysis
- **Convex Database**: Real-time reactive database with TypeScript-first development, perfect for public content model
- **Clerk Authentication**: Industry-leading auth platform with magic link priority and OAuth fallback
- **Existing Middleware**: Sophisticated IP-based rate limiting already implemented, ready for enhancement
- **Next.js 15 + React 19**: Full compatibility with chosen stack, server components optimize performance

### Codebase Integration
- **Existing Rate Limiting** (`middleware.ts:225-285`): Sophisticated IP-based system ready for user-based enhancement
- **API Route Pattern** (`app/api/generate-zine/route.ts`): Established error handling and validation patterns
- **Hook Architecture** (`app/hooks/useZineGeneration.ts`): State management pattern ready for auth integration
- **Environment Config**: Convex deployment URLs already configured in `.env.local`

## Detailed Requirements

### Functional Requirements
- **FR1: Anonymous Generation**: Users can generate 2 zines per hour without authentication
- **FR2: Authenticated Benefits**: Authenticated users can generate 10 zines per day
- **FR3: Public Zines**: All generated zines are publicly accessible via unique URLs
- **FR4: Session Migration**: Anonymous usage transfers seamlessly upon authentication
- **FR5: Magic Link Auth**: Primary authentication via email magic links
- **FR6: OAuth Support**: Google OAuth as secondary authentication option

### Non-Functional Requirements
- **Performance**: Maintain < 2s API response time (99th percentile)
- **Security**: Zero authentication bypasses, secure session management
- **Scalability**: Support 10,000 concurrent users without degradation
- **Availability**: 99.9% uptime with graceful degradation to IP-based limiting

## Architecture Decisions

### Technology Stack
- **Frontend**: Next.js 15 App Router with React 19
- **Backend**: Convex serverless functions with TypeScript
- **Authentication**: Clerk with magic links + Google OAuth
- **Database**: Convex reactive database with public content model
- **Rate Limiting**: Hybrid middleware (database primary, IP fallback)

### Design Patterns
- **Architecture Pattern**: Serverless with edge middleware for optimal performance
- **Data Flow**: Client → Middleware → API → Convex → OpenAI
- **Integration Pattern**: JWT-based session management between Clerk and Convex

### Proposed ADR
[See ADR-002 above for complete architecture decision record]

## Implementation Strategy

### Development Approach
Progressive enhancement in 3 phases over 6 weeks:
1. Foundation (Weeks 1-2): Clerk setup, Convex schema
2. Rate Limiting (Weeks 3-4): Hybrid system, session migration
3. Integration (Weeks 5-6): Frontend updates, testing

### MVP Definition
1. Magic link authentication with Clerk
2. Convex database storing all zines publicly
3. Tiered rate limiting (2/hour anonymous, 10/day authenticated)
4. Session migration for anonymous→authenticated users

### Technical Risks
- **Risk 1: Database Unavailability** → Mitigation: IP-based fallback system
- **Risk 2: Session Migration Bugs** → Mitigation: Comprehensive testing, gradual rollout
- **Risk 3: Rate Limit Gaming** → Mitigation: Multiple tracking vectors (IP + user ID)

## Integration Requirements

### Existing System Impact
- **Middleware Enhancement**: Extend existing rate limiting with user awareness
- **API Route Modification**: Add database persistence after generation
- **Hook Updates**: Integrate authentication state in useZineGeneration
- **UI Components**: Add authentication prompts in SubjectForm

### API Design
```typescript
// Enhanced API endpoint
POST /api/generate-zine
Headers: 
  - Authorization: Bearer [JWT] (optional)
Body:
  - subject: string
Response:
  - zineId: string (new)
  - zineData: object (existing)
  - publicUrl: string (new)
```

### Data Migration
- No existing data to migrate (greenfield feature)
- Anonymous session data expires after 24 hours
- Rate limit counters reset on defined windows

## Testing Strategy

### Unit Testing
- Convex function testing with mock authentication
- Rate limit calculation logic validation
- Session migration edge cases

### Integration Testing
- Clerk + Convex JWT validation flow
- Middleware fallback scenarios
- Anonymous→authenticated journey

### End-to-End Testing
- Complete user flows from anonymous to authenticated
- Rate limit enforcement across tiers
- Public zine accessibility

## Deployment Considerations

### Environment Requirements
```env
# Existing
NEXT_PUBLIC_CONVEX_URL_DEV=https://youthful-albatross-854.convex.cloud
NEXT_PUBLIC_CONVEX_URL_PROD=https://laudable-hare-856.convex.cloud
OPENAI_API_KEY=sk-...

# New
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CONVEX_DEPLOYMENT=production
```

### Rollout Strategy
1. Deploy Convex schema and functions
2. Configure Clerk with custom neobrutalist theme
3. Deploy middleware enhancements with feature flag
4. Gradual rollout: 10% → 50% → 100% over 48 hours

### Monitoring & Observability
- Track rate limit hits by tier in Convex
- Monitor authentication conversion funnel in Clerk
- Alert on fallback activation rate > 1%
- Dashboard for tier distribution and usage patterns

## Success Criteria

### Acceptance Criteria
- [ ] Anonymous users can generate exactly 2 zines per hour
- [ ] Authenticated users can generate exactly 10 zines per day
- [ ] All zines have public URLs and are accessible
- [ ] Magic link authentication works within 30 seconds
- [ ] Session migration preserves rate limit state

### Performance Metrics
- API latency p99 < 2 seconds
- Authentication time < 30 seconds
- Rate limit accuracy > 99%
- Fallback activation < 1%

### User Experience Goals
- Zero-friction anonymous usage
- Smooth authentication upgrade path
- Clear rate limit communication
- Instant public sharing capability

## Future Enhancements

### Post-MVP Features
- Email/password authentication option
- User dashboard with generation history
- Social sharing enhancements
- Zine search and discovery
- Custom themes for authenticated users

### Scalability Roadmap
- Redis-based distributed rate limiting
- CDN-cached public zines
- Multi-region Convex deployment
- API key access for developers
- Webhook notifications for generation events
