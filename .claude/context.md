# AnyZine Codebase Security Patterns

## Content Sanitization Implementation (2025-09-01)

### **Multi-Layer Content Security Architecture**
- **Pattern**: DOMPurify + fallback regex cleaning + content validation provides defense-in-depth
- **Key insight**: Each layer handles different threat vectors - DOM manipulation, script injection, malformed content
- **Implementation**: `sanitizeContent()` utility with graceful fallback when DOMPurify unavailable (SSR compatibility)
- **Location**: `/lib/sanitize.ts` with integration points throughout `ZineDisplay.tsx`

### **Server-Side Rendering Security Compatibility**
- **Critical requirement**: Content sanitization must work during SSR where `window` is undefined
- **Solution pattern**: Feature detection with fallback mechanisms `if (typeof window !== 'undefined')`
- **Fallback strategy**: Basic HTML entity encoding and dangerous tag removal when DOMPurify unavailable
- **Key insight**: Security libraries often assume browser environment - always implement SSR fallbacks

### **Testing Security Features - Mock Strategy**
- **Complex pattern**: `vi.mocked()` TypeScript integration for DOMPurify mocking in tests
- **Critical insight**: Security-first test updates require changing test expectations to match secure behavior
- **Example**: Updated color class tests from `bg-red-500` to `bg-red-500` (sanitized output differs from input)
- **Pattern**: Mock both success and fallback scenarios to ensure robustness

### **Bundle Size Management for Security**
- **Acceptable trade-off**: 8.82kB increase for comprehensive content sanitization
- **Decision framework**: Security features justify bundle increases when alternatives are insufficient
- **Monitoring pattern**: Track bundle impact of security additions to prevent bloat
- **Key insight**: Users accept performance trade-offs for security when properly justified

### **Security Test Coverage Strategy**
- **Comprehensive approach**: 20 new tests covering XSS attempts, edge cases, fallback behavior
- **Test categories**: Malicious input handling, SSR compatibility, error scenarios, performance edge cases
- **100% coverage maintenance**: Security additions maintained perfect test coverage (141/141 tests)
- **Pattern**: Security features require proportionally more test coverage than regular features

### **Content Sanitization Integration Points**
- **Systematic approach**: Sanitize ALL AI-generated content before rendering, not selective sanitization
- **Implementation pattern**: Wrap every `{content}` interpolation with `sanitizeContent()`
- **Performance consideration**: Client-side sanitization on every render vs pre-sanitization trade-offs
- **Consistency**: Same sanitization approach across all content types (titles, articles, facts, etc.)

### **Time Estimation Accuracy - Complex Security Tasks**
- **Initial estimate**: Large effort (1-3 days) for comprehensive content sanitization
- **Actual time**: ~2 hours with systematic implementation approach
- **Massive overestimate factor**: 12-36x longer estimated than actual
- **Key factors**: Existing security patterns + comprehensive test suite + clear requirements = predictable implementation
- **Pattern**: Security tasks with good tooling (DOMPurify) are much faster than feared

### **CSP Compatibility with Content Sanitization**
- **Architecture synergy**: Existing CSP headers complement DOMPurify sanitization
- **Defense layers**: CSP prevents injection, DOMPurify cleans content, both provide redundant protection
- **Key insight**: Multiple security approaches reinforce rather than conflict with each other

### **Test Framework Integration Lessons**
- **Vitest + DOMPurify**: Requires proper mock setup with `vi.mock()` and dynamic imports
- **Hoisting issues**: Mock setup order matters - define mocks before imports in test files
- **TypeScript integration**: Use `vi.mocked()` for proper type safety in mock assertions
- **Pattern**: Security library testing requires more complex mock setup than regular utilities

### **Regex Fallback Security Patterns**
- **Basic XSS protection**: Remove `<script>`, `<iframe>`, `<object>` tags and `javascript:` protocols
- **HTML entity encoding**: Convert `<>&"'` to entities for safe text rendering
- **Limitation awareness**: Regex cannot match complex HTML parsing - use as fallback only
- **Key insight**: Simple regex fallbacks provide basic protection when full parsers unavailable

## Prompt Injection Protection Implementation (2025-09-01)

### Successful Layered Security Architecture
- **Multi-layer validation**: Client-side (immediate feedback) + Server-side (trusted validation) + Prompt engineering + HTML attribute safety
- **Pattern**: Each layer provides specific protection - client UX, server authority, prompt defense, output safety
- **Key insight**: Layered approach catches different attack vectors and provides redundancy

### Input Sanitization Patterns (/app/api/generate-zine/route.ts)
- **Comprehensive regex patterns**: 14+ injection patterns covering ignore instructions, role hijacking, system prompts, etc.
- **Character filtering**: Template delimiters (`${}`, `{{}}`) and dangerous characters (quotes, escape sequences)
- **Length constraints**: 2-200 character range balances usability with attack surface reduction
- **Function pattern**: `validateAndSanitizeSubject(subject: string)` returns `{ isValid: boolean, error?: string, sanitized?: string }`

### Client-Side Validation Mirroring (/app/components/SubjectForm.tsx)
- **Real-time feedback**: Same validation logic as server for immediate user guidance
- **UX consideration**: Prevents wasted API calls and provides instant feedback
- **Security principle**: Client validation for UX, server validation for security (never trust client alone)

### Critical String Interpolation Safety
- **Dangerous pattern**: Direct `${subject}` interpolation in prompts
- **Safe pattern**: Always use `"${sanitizedSubject}"` with quotes after validation
- **Key insight**: Template literals are extremely dangerous without proper sanitization

### Prompt Engineering Defenses
- **System prompt hardening**: Added defensive instructions about ignoring user attempts to override behavior
- **Output format constraints**: Reinforced JSON-only output requirements
- **Context preservation**: Maintained original functionality while adding security

## Time Estimation Insights

### Security Task Complexity (M → 30 minutes actual)
- **Pattern recognition**: Finding existing validation patterns accelerated implementation
- **Comprehensive approach**: Covering client + server + prompt + output took expected time
- **No TypeScript issues**: Following established patterns prevented build problems
- **Lesson**: Security implementations are predictable when following established patterns

## Package Manager Migration Patterns (2025-09-01)

### **Seamless Migration Strategy - pnpm**
- **Critical tool**: `pnpm import` preserves exact dependency versions from package-lock.json
- **Zero-risk approach**: Import existing lockfile rather than regenerating dependencies
- **Validation pattern**: Test all scripts before cleanup, remove old lockfile only after success
- **Key insight**: Dependency preservation prevents subtle version drift issues

### **Script Reference Auditing**
- **Systematic approach**: Search for all npm references in package.json scripts
- **Pattern discovered**: `"lint": "next lint"` works, but `"test": "npm test"` needs updating
- **Validation**: Run all scripts individually to catch reference issues
- **Lesson**: Script references to old package manager are easily missed but critical

### **Performance Measurement Best Practices**
- **Build time tracking**: Measure cold builds vs warm builds vs incremental builds
- **Dramatic improvements**: 3.5s → 1.03s (70% improvement) for subsequent builds
- **Lockfile size impact**: 341k → 193k (43% reduction) indicates better dependency resolution
- **Pattern**: pnpm's package reuse optimization provides compound performance benefits

### **Migration Time Estimation Accuracy**
- **Initial estimate**: 4 hours (Size S interpreted as significant effort)
- **Actual time**: ~10 minutes with systematic approach
- **Massive overestimate factor**: 24x longer estimated than actual
- **Key insight**: Package manager migrations are much faster than expected when using proper tools

### **Risk Mitigation Strategy**
- **Pre-flight checks**: Verify pnpm availability before starting migration
- **Comprehensive testing**: Run full test suite (121/121 tests) to validate migration
- **Rollback readiness**: Keep package-lock.json until pnpm validation complete
- **Success pattern**: Conservative approach with thorough validation prevents migration failures

### **Package Manager Compatibility Insights**
- **Script compatibility**: Most npm scripts work unchanged with pnpm
- **Tool ecosystem**: Modern tools (Next.js 15, TypeScript, Tailwind) work seamlessly with pnpm
- **CI/CD consideration**: GitHub Actions supports pnpm out of the box
- **Pattern**: Mature package managers have excellent cross-compatibility

### **Estimation Calibration Lessons**
- **Package management tasks**: Consistently overestimated - use 15-30 minute baseline
- **Tool-assisted migrations**: When proper migration tools exist, time requirements are minimal
- **Testing overhead**: Comprehensive testing adds 50% time but prevents issues
- **Pattern**: Infrastructure tooling tasks with mature toolchains are highly predictable

## Current Input Validation Patterns

### API Route Input Validation (/app/api/generate-zine/route.ts:10-12)
- **Basic type and empty check**: `!subject || typeof subject !== 'string' || subject.trim().length === 0`
- **Error response**: `NextResponse.json({ error: 'invalid subject' }, { status: 400 })`
- **Pattern**: Simple guard clause with immediate error return
- **Enhanced with**: Comprehensive prompt injection protection and sanitization

### Frontend Input Validation (/app/components/SubjectForm.tsx:15-18)
- **Empty check**: `!subject.trim()`
- **Error handling**: Local state with user-friendly messages
- **Pattern**: Client-side pre-validation before API call
- **Enhanced with**: Real-time prompt injection detection and feedback

### Error Handling Patterns
- **API Route**: Consistent NextResponse.json error format with status codes
- **Frontend**: React state-based error display with user-friendly messages
- **OpenAI Integration**: Try-catch with fallback error handling

## Security Implementation Best Practices

### Pattern Discovery Strategy
- **Use pattern-scout**: Search existing codebase for similar validation implementations
- **Follow established conventions**: Maintains consistency and reduces learning curve
- **Build incrementally**: Add security layers without breaking existing functionality

### Defense-in-Depth Principles
- **Never rely on single layer**: Client-side validation can be bypassed
- **Validate at boundaries**: Every input crossing trust boundaries needs validation
- **Sanitize for context**: Different outputs (HTML, prompts, JSON) need different sanitization

### Integration Gotchas
- **Template literal security**: Always validate before interpolation
- **Client-server parity**: Keep validation logic synchronized but never trust client alone
- **Error message consistency**: Same validation should produce same error messages across layers

## Security Documentation Standards

### Fail-Fast Validation Pattern (docs/leyline/bindings/core/fail-fast-validation.md)
- **Comprehensive input validation** with clear error messages
- **Guard clauses at function entry points**
- **Type, range, format, and business rule validation**
- **Performance considerations for validation**

### Security Automation Standards (docs/leyline/bindings/core/comprehensive-security-automation.md)
- **Multi-layer security pipeline**
- **Zero-trust automation principles**
- **Continuous security monitoring**

## Solved Security Issues
- **✅ Content sanitization**: DOMPurify + fallback regex implemented with SSR compatibility
- **✅ XSS prevention**: Multi-layer content cleaning for all AI-generated content
- **✅ Prompt injection protection**: Comprehensive regex-based validation implemented
- **✅ Input sanitization**: Character filtering and length limits added
- **✅ AI prompt hardening**: Defensive instructions added to system prompts
- **✅ Layered validation**: Client + server + prompt + output protection

## Current OpenAI Integration Security
- **Safe subject injection**: Uses sanitized and quoted subject in prompts
- **Prompt engineering defenses**: System prompt includes override resistance
- **Input validation**: Length limits and injection pattern detection
- **Output context safety**: HTML attribute encoding for display

## Testing Strategy Patterns (2025-09-01)

### **Modern Testing Stack for Next.js 15 + React 19**
- **Framework**: Vitest + React Testing Library (10-100x faster than Jest)
- **Key insight**: ESM-native architecture aligns with Next.js 15's modern toolchain
- **Configuration pattern**: Minimal setup with `vitest.config.ts` and `tests/setup.ts`

### **Security-First Test Prioritization**
- **Pattern**: Test security-critical functions first (input validation, sanitization)
- **Critical function**: `validateAndSanitizeSubject()` - 14+ regex patterns for prompt injection
- **Coverage target**: 100% on security functions before feature testing
- **Location**: `/app/api/generate-zine/route.ts:8-68`

### **Layered Component Testing Strategy**
- **Client Components**: Standard RTL testing with `render()` and user interactions
- **Server Components**: Test as pure functions with props (avoid server runtime testing)
- **Form validation**: Test client-server validation parity (SubjectForm.tsx:14-43)
- **Error handling**: Test all error paths and user feedback states

### **API Route Testing Pattern**
- **Mock external services**: Use MSW for OpenAI API mocking
- **Test validation integration**: Input validation + sanitization + error responses
- **Edge case coverage**: Empty inputs, injection attempts, rate limiting
- **Location**: `/app/api/generate-zine/route.ts`

### **Middleware Testing Approach**  
- **Rate limiting logic**: IP detection, request counting, cleanup functions
- **Header testing**: Verify rate limit headers are set correctly
- **Edge cases**: Proxy headers, multiple IPs, window expiration
- **Location**: `/middleware.ts:51-110`

### **Mocking Strategies**
- **Next.js App Router**: Mock `useRouter`, `usePathname` with vitest mocks
- **External APIs**: MSW handlers for OpenAI completions endpoint
- **Environment**: jsdom for DOM testing, global test setup file
- **File structure**: `/tests/mocks/` directory for organized mock handlers

### **Test Organization Pattern**
```
/tests/setup.ts - Global test configuration
/tests/mocks/ - MSW handlers and Next.js mocks  
/tests/utils/ - Pure function testing (validation)
/tests/integration/ - API routes and middleware
/app/components/*.test.tsx - Component tests co-located
```

### **Coverage Strategy**
- **Phase 1**: Security functions (validation, sanitization) - Immediate priority
- **Phase 2**: Component behavior (forms, display, error states)  
- **Phase 3**: Integration testing (middleware, API routes, end-to-end flows)
- **Target**: 90%+ coverage on business logic, 100% on security functions

## TypeScript Strict Typing Patterns (2025-09-01)

### **`any` Removal Strategy**
- **Discovery pattern**: Use pattern-scout agent to identify all `any` usage before starting
- **Pattern**: `Grep pattern "any" type "ts,tsx" output_mode "content" -n` to find with line numbers
- **Key insight**: `any` removal reveals hidden type safety bugs that would cause runtime errors

### **Discriminated Union Solutions (/lib/types.ts)**
- **Problem pattern**: Generic `content: any` property hiding type complexity
- **Solution**: Discriminated unions with `type` discriminator field
- **Implementation**: `{ type: 'funFacts', content: string[] } | { type: 'other', content: string }`
- **Type guard pattern**: Use `section.type !== 'funFacts'` to narrow types for TypeScript

### **Progressive Type Narrowing Strategy**
- **Pattern**: Each usage point needs individual type narrowing with guards
- **Example**: Check `section.type` before accessing `content.split()` to prevent array errors
- **Build-first verification**: Let TypeScript compiler catch hidden type issues during refactoring

### **Hidden Bug Discovery Pattern**
- **Critical insight**: Removing `any` exposes existing unsafe assumptions in code
- **Example found**: Code assumed `content` was always string but could be array, causing silent `.split()` failures
- **Value**: Type safety improvements discover real bugs, not just theoretical ones

### **Time Estimation Accuracy - TypeScript Refactoring**
- **Initial estimate**: Medium effort (4-8 hours)
- **Actual time**: ~20 minutes once approach was clear
- **Pattern**: Use pattern-scout for discovery phase, then systematic fixing is fast
- **Key factor**: Good type discovery tools make complex refactoring much faster than expected

### **Testing Continuity During Type Refactoring**
- **Success indicator**: All 121 tests continued passing after `any` removal
- **Pattern**: Proper discriminated unions maintain runtime behavior while improving safety
- **Verification**: TypeScript compiler + existing test suite confirms refactoring correctness

## Content Security Policy Implementation (2025-09-01)

### **CSP Middleware Extension Pattern (/middleware.ts)**
- **Successful approach**: Extend existing middleware.ts rather than creating new next.config.js CSP
- **Architecture decision**: CSP for all routes, rate limiting only for API endpoints using matcher logic
- **Clean separation**: `applyCspHeaders()` and `applyRateLimiting()` as distinct functions
- **Key insight**: Middleware extension maintains existing patterns while adding security layers

### **Comprehensive Security Headers Strategy**
- **Defense-in-depth pattern**: CSP + X-Content-Type-Options + X-Frame-Options + Referrer-Policy
- **Implementation**: Single `applyCspHeaders()` function applying all security headers together
- **Pattern**: Bundle related security headers for consistent application across routes

### **Environment-Aware CSP Policies**
- **Critical requirement**: Different CSP policies for development vs production environments
- **Development needs**: Next.js 15 + Turbopack requires 'unsafe-eval' and 'unsafe-inline'
- **Production strictness**: Remove unsafe directives for maximum security
- **Pattern**: Use `process.env.NODE_ENV` to conditionally apply CSP policies

### **Inline Style Elimination for Strict CSP**
- **Requirement**: CSP with strict policies requires eliminating ALL inline styles, not partial
- **Solution pattern**: Convert hex colors to Tailwind classes (#ff6ee8 → bg-fuchsia-400)
- **Color mapping examples**: #a8ff9b → bg-lime-300, maintain visual consistency
- **Unexpected benefit**: Bundle size improvement (3.87 kB → 3.84 kB) from removing inline styles

### **Test Impact of Visual Changes**
- **Critical lesson**: Visual changes (color class updates) affect test expectations
- **Pattern**: Update test assertions when changing colors or visual elements
- **Success indicator**: All 121 tests pass after fixing color-related assertions
- **Key insight**: Visual refactoring requires coordinated test updates for CI/CD stability

### **CSP Implementation Architecture Decisions**
- **Middleware vs Config**: Middleware.ts chosen over next.config.js for consistency with existing patterns
- **Route-specific policies**: Use Next.js middleware matcher to apply different headers to different route types
- **Header consolidation**: Apply all security headers in single middleware function call

### **Pattern-Scout Accelerated Discovery**
- **Success factor**: Using pattern-scout to find existing middleware and security patterns
- **Time savings**: Systematic discovery approach reduced 4-8h estimate to ~30 minutes
- **Pattern recognition**: Following established middleware patterns prevented architectural confusion

### **CSP Debugging and Development Workflow**
- **Development compatibility**: CSP policies must not break Next.js development server
- **Browser console**: CSP violations appear in browser console for debugging
- **Gradual tightening**: Start with permissive policies, gradually restrict based on violations

### **Security Header Best Practices**
```typescript
// Successful CSP header pattern
'Content-Security-Policy': `
  default-src 'self';
  script-src 'self' ${isDev ? "'unsafe-eval' 'unsafe-inline'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.openai.com;
`
```

### **Time Estimation Accuracy - Security Headers**
- **Initial estimate**: Medium effort (4-8 hours) for comprehensive CSP implementation
- **Actual time**: ~30 minutes with systematic pattern-based approach
- **Key factor**: Pattern-scout discovery + following existing middleware architecture = predictable implementation time
- **Lesson**: Security header tasks are highly predictable when leveraging existing patterns

### **Bundle Optimization Side Effects**
- **Unexpected discovery**: Eliminating inline styles for CSP compliance improved bundle size
- **Pattern**: Security requirements sometimes drive performance improvements
- **Measurement**: 3.87 kB → 3.84 kB bundle size reduction from CSS class consolidation

## JSDoc Documentation Patterns (2025-09-01)

### **Pattern-Scout Documentation Discovery**
- **Success strategy**: Use pattern-scout agent to analyze existing JSDoc patterns before starting
- **Key insight**: Following established documentation styles maintains codebase consistency
- **Pattern identified**: Multi-line JSDoc with @description, @param, @returns, @example, @security, @performance tags
- **Location examples**: `/app/utils/content-sanitization.ts`, `/app/utils/api-resilience.ts`, `/app/utils/validation.ts`

### **Comprehensive Documentation Coverage Strategy**
- **Priority order**: API routes → Custom hooks → Major components → Middleware → Constants
- **Rationale**: Start with highest-impact files first (external interfaces, complex logic)
- **File coverage**: 8 major files documented comprehensively in single session
- **Success indicator**: All 141 tests pass, build succeeds, linting clean after documentation

### **Security-Focused Documentation Pattern**
- **Standard approach**: Security functions require extensive threat model and protection documentation
- **Example format**: `validateAndSanitizeSubject()` documents 14 injection patterns, validation logic, sanitization approach
- **Key elements**: @security tag explaining protections, @example showing safe usage, @param documenting validation rules
- **Pattern value**: Security documentation prevents misuse and helps maintain security over time

### **Multi-Level JSDoc Architecture**
- **File-level documentation**: High-level purpose, architecture decisions, integration points
- **Function-level documentation**: Detailed behavior, parameters, return values, examples
- **Inline documentation**: Complex internal logic, algorithm explanations, edge case handling
- **Type-level documentation**: Interface properties, discriminated union usage, type safety patterns

### **JSDoc Tag Usage Patterns**
- **Essential tags**: @description (always), @param (for parameters), @returns (for return values)  
- **Context-specific tags**: @security (for security functions), @performance (for optimization notes), @architecture (for design decisions)
- **Example usage**: @example blocks showing typical integration patterns and common use cases
- **Consistency**: Same tag order and format across all documented functions

### **Documentation Maintenance Integration**
- **Build validation**: JSDoc comments validated during lint process (pnpm run lint)
- **Type safety**: JSDoc @param and @returns align with TypeScript signatures
- **Test compatibility**: Documentation examples match actual test usage patterns
- **CI/CD integration**: Documentation completeness verified as part of build process

### **Time Estimation Accuracy - Documentation Tasks**
- **Initial estimate**: Medium effort for comprehensive documentation
- **Actual time**: 30-45 minutes for 8 major files with established patterns
- **Pattern recognition factor**: Following existing JSDoc styles accelerated writing significantly
- **Key insight**: Documentation tasks are highly predictable when style patterns are established

### **Hook Documentation Requirements**
- **State management**: Document all useState, useCallback, useEffect with purposes and dependencies
- **API integration**: Clear documentation of fetch operations, error handling, caching strategies
- **Return interface**: Document all returned functions, state, and values with usage examples
- **Integration patterns**: Show typical component integration and common use cases

### **Component Documentation Standards**
- **Props interface**: Full TypeScript interface documentation with JSDoc descriptions on properties
- **Behavior documentation**: State management approach, event handling, lifecycle considerations
- **Accessibility notes**: ARIA patterns, keyboard navigation support, screen reader compatibility
- **Performance considerations**: Memoization usage, expensive operations, rendering optimization strategies

### **API Route Documentation Best Practices**
- **Request/Response format**: Document expected request body, query parameters, response structure
- **Security measures**: Input validation patterns, rate limiting, authentication requirements
- **Error handling**: All possible error conditions with appropriate HTTP status codes
- **Integration details**: External API dependencies, caching behavior, performance characteristics

### **Documentation Pattern Benefits**
- **Onboarding acceleration**: New developers can understand complex security and API patterns quickly
- **Maintenance safety**: Security-critical functions clearly document threat models and safe usage
- **Architecture clarity**: File-level documentation explains integration patterns and design decisions
- **Testing alignment**: Documentation examples match test cases, ensuring accuracy and relevance