# AnyZine API Documentation

## Overview

AnyZine provides a RESTful API for generating AI-powered digital zines. The API includes authentication, rate limiting, and persistent storage features.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

AnyZine uses Clerk for authentication. Authentication is optional but provides higher rate limits.

### Authentication Methods
- **Magic Link**: Email-based passwordless authentication
- **Google OAuth**: Sign in with Google account
- **Session Cookies**: Automatic session management via Clerk

### Authentication States
- **Anonymous**: No authentication, limited to 2 requests/hour
- **Authenticated**: Signed in users, limited to 10 requests/day

## Endpoints

### Generate Zine

Creates a new AI-generated zine on the specified subject.

**Endpoint:** `POST /api/generate-zine`

#### Request

**Headers:**
```http
Content-Type: application/json
Cookie: __session=<clerk_session_token> (optional, for authenticated requests)
```

**Body:**
```json
{
  "subject": "string (required, max 200 characters)"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/generate-zine \
  -H "Content-Type: application/json" \
  -d '{"subject": "retro gaming"}'
```

#### Response

**Success Response (200 OK):**
```json
{
  "sections": [
    {
      "type": "banner",
      "content": "RETRO GAMING REVIVAL"
    },
    {
      "type": "subheading",
      "content": "PIXELS, NOSTALGIA, AND THE 8-BIT RENAISSANCE"
    },
    {
      "type": "intro",
      "content": "Step into the neon-lit arcade of yesteryear..."
    },
    {
      "type": "mainArticle",
      "title": "THE CARTRIDGE COMEBACK",
      "content": "In an era of 4K graphics and ray tracing..."
    },
    {
      "type": "opinion",
      "title": "HOT TAKE",
      "content": "Modern games have forgotten the art of limitation..."
    },
    {
      "type": "funFacts",
      "title": "DID YOU KNOW?",
      "facts": [
        "The NES could only display 25 colors simultaneously",
        "Pac-Man was originally called Puck-Man",
        "The first gaming tournament was held in 1972"
      ]
    },
    {
      "type": "conclusion",
      "content": "The pixels may be bigger, but the memories are timeless."
    }
  ],
  "publicId": "zine_abc123xyz",
  "publicUrl": "/zines/zine_abc123xyz",
  "zineId": "convex_id_123"
}
```

**Rate Limit Response (429 Too Many Requests):**
```json
{
  "error": "Too many requests. Please wait 30 seconds before trying again.",
  "retryAfter": 30,
  "tier": "anonymous",
  "upgradeAvailable": true
}
```

**Validation Error Response (400 Bad Request):**
```json
{
  "error": "Invalid input: Subject contains prohibited content"
}
```

**Server Error Response (500 Internal Server Error):**
```json
{
  "error": "Failed to generate zine content"
}
```

#### Response Headers

All responses include rate limiting headers:

```http
X-RateLimit-Limit: 2           # Maximum requests allowed
X-RateLimit-Remaining: 1       # Requests remaining in current window
X-RateLimit-Reset: 1704067200  # Unix timestamp when limit resets
X-RateLimit-Tier: anonymous    # Current user tier (anonymous/authenticated)
Retry-After: 30                # Seconds to wait (only on 429 responses)
```

## Rate Limiting

### Tiers

| Tier | Limit | Window | Description |
|------|-------|--------|-------------|
| Anonymous | 2 requests | 1 hour | Tracked by session cookie |
| Authenticated | 10 requests | 24 hours | Tracked by user ID |

### Rate Limit Tracking

Rate limits are tracked using multiple identifiers:

1. **User ID** (authenticated users)
2. **Session ID** (anonymous users via cookie)
3. **IP Address** (fallback when no session)

### Session Migration

When an anonymous user authenticates:
- Their session usage history is migrated to their user account
- Rate limits are recalculated based on the authenticated tier
- The session cookie is cleared after successful migration

### Rate Limit Headers

Every API response includes rate limit information:

- `X-RateLimit-Limit`: Maximum requests for your tier
- `X-RateLimit-Remaining`: Requests left in current window
- `X-RateLimit-Reset`: Unix timestamp (seconds) when limit resets
- `X-RateLimit-Tier`: Your current tier (anonymous/authenticated)

## Public Zine Access

Generated zines are accessible via public URLs without authentication.

**URL Pattern:** `/zines/{publicId}`

**Example:** `https://anyzine.com/zines/zine_abc123xyz`

### Public Zine Page Features
- Full zine content display
- Share buttons (Twitter/X, Copy Link)
- No authentication required
- No rate limiting for viewing

## Input Validation

The API implements comprehensive input validation:

### Prohibited Patterns
- Prompt injection attempts (e.g., "ignore previous instructions")
- System prompts or role-playing instructions
- Encoded/obfuscated commands
- Excessive special characters or formatting
- HTML/JavaScript injection attempts

### Subject Requirements
- Maximum 200 characters
- Must contain valid text content
- Cannot be empty or whitespace only
- Unicode characters are supported

## Error Handling

### Error Response Format

All error responses follow this structure:

```json
{
  "error": "string",          // Human-readable error message
  "code": "string",           // Optional error code
  "details": {},             // Optional additional details
  "retryAfter": number,      // Optional, seconds to wait
  "upgradeAvailable": boolean // Optional, for rate limits
}
```

### Common Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Invalid input or validation failure |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | OpenAI API or Convex unavailable |

## Security

### Content Security

- **Input Sanitization**: All user input is validated and sanitized
- **Prompt Injection Protection**: 14+ patterns detected and blocked
- **XSS Prevention**: Content sanitized with DOMPurify
- **CSP Headers**: Strict Content Security Policy enforced

### Session Security

- **httpOnly Cookies**: Session cookies cannot be accessed via JavaScript
- **Secure Flag**: Cookies only sent over HTTPS in production
- **SameSite=Lax**: CSRF protection
- **30-day Expiry**: Anonymous sessions expire after 30 days

## WebSocket Updates

Rate limit status updates are available via WebSocket through Convex:

```javascript
// Client-side subscription
import { useQuery } from "convex/react";

const rateLimitStatus = useQuery("rateLimits:checkRateLimit", {
  userId: user?.id,
  sessionId: sessionId
});
```

Updates are pushed in real-time when:
- A new request is made
- Rate limits reset
- User authentication status changes

## Example Integration

### JavaScript/TypeScript

```typescript
async function generateZine(subject: string) {
  const response = await fetch('/api/generate-zine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subject }),
    credentials: 'include' // Include cookies for authentication
  });

  if (response.status === 429) {
    const error = await response.json();
    console.log(`Rate limited. Wait ${error.retryAfter} seconds`);
    return null;
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const zine = await response.json();
  console.log(`Zine created: ${zine.publicUrl}`);
  return zine;
}
```

### React Hook

```typescript
import { useZineGeneration } from '@/app/hooks/useZineGeneration';

function MyComponent() {
  const { 
    generateZine, 
    loading, 
    error, 
    zineData,
    isAuthenticated,
    userTier 
  } = useZineGeneration();

  const handleGenerate = async () => {
    await generateZine('my subject');
    if (zineData) {
      window.location.href = zineData.publicUrl;
    }
  };

  return (
    <button onClick={handleGenerate} disabled={loading}>
      Generate Zine ({userTier} tier)
    </button>
  );
}
```

## Testing

### Test Endpoints

In development, you can test rate limiting:

```bash
# Anonymous user - will be rate limited after 2 requests
for i in {1..3}; do
  curl -X POST http://localhost:3000/api/generate-zine \
    -H "Content-Type: application/json" \
    -d '{"subject": "test '$i'"}'
  echo ""
done
```

### Mock Responses

For testing without consuming OpenAI credits, set:
```env
MOCK_OPENAI_RESPONSES=true
```

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Zine generation endpoint
- Authentication with Clerk
- Tiered rate limiting
- Session migration
- Public zine URLs
- Real-time rate limit updates