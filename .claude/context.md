# AnyZine Codebase Security Patterns

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