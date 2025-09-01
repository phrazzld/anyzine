// API resilience utilities for OpenAI integration

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

// In-memory cache for zine generation responses
const responseCache = new Map<string, CacheEntry>();

// Cache cleanup interval (5 minutes)
const CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache TTL
const REQUEST_TIMEOUT = 30 * 1000; // 30 second timeout
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Cleanup expired cache entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of responseCache) {
      if (entry.expiresAt < now) {
        responseCache.delete(key);
      }
    }
  }, CACHE_CLEANUP_INTERVAL);
}

/**
 * Create cache key from request parameters
 */
function createCacheKey(subject: string): string {
  // Create a simple hash of the subject for cache key
  return `zine:${subject.toLowerCase().trim()}`;
}

/**
 * Get cached response if available and not expired
 */
function getCachedResponse(cacheKey: string): any | null {
  const cached = responseCache.get(cacheKey);
  if (!cached) return null;
  
  const now = Date.now();
  if (cached.expiresAt < now) {
    responseCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

/**
 * Cache successful response
 */
function cacheResponse(cacheKey: string, data: any): void {
  const now = Date.now();
  responseCache.set(cacheKey, {
    data,
    timestamp: now,
    expiresAt: now + CACHE_TTL,
  });
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, response?: Response): boolean {
  // Network errors are retryable
  if (!response) return true;
  
  // Server errors (5xx) are retryable
  if (response.status >= 500 && response.status < 600) return true;
  
  // Rate limiting might be retryable (but we handle it separately)
  if (response.status === 429) return false;
  
  // Client errors (4xx) are generally not retryable
  if (response.status >= 400 && response.status < 500) return false;
  
  return false;
}

/**
 * Create fetch request with timeout
 */
function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });
}

/**
 * Resilient fetch with timeout, retry, and caching
 */
export async function resilientZineGeneration(subject: string): Promise<any> {
  const cacheKey = createCacheKey(subject);
  
  // Check cache first
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    console.log('Returning cached zine response for:', subject);
    return cached;
  }
  
  let lastError: any;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout("/api/generate-zine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle rate limiting - don't retry, pass through immediately
        if (response.status === 429) {
          throw {
            isRateLimit: true,
            status: 429,
            retryAfter: errorData.retryAfter || 60,
            message: `Too many requests. Please wait ${errorData.retryAfter || 60} seconds before trying again.`
          };
        }
        
        // Check if error is retryable
        if (!isRetryableError(null, response) || attempt === MAX_RETRIES - 1) {
          throw {
            status: response.status,
            message: errorData.error || "API request failed",
            isRetryable: false
          };
        }
        
        // Retryable error - continue to retry logic
        lastError = {
          status: response.status,
          message: errorData.error || "API request failed",
          isRetryable: true
        };
      } else {
        // Success - parse and cache response
        const data = await response.json();
        cacheResponse(cacheKey, data);
        return data;
      }
    } catch (error: any) {
      // Handle network errors and other exceptions
      if (error.isRateLimit) {
        // Rate limit errors should not be retried
        throw error;
      }
      
      if (error.name === 'AbortError') {
        lastError = {
          message: "Request timed out after 30 seconds",
          isTimeout: true,
          isRetryable: attempt < MAX_RETRIES - 1
        };
      } else {
        lastError = {
          message: error.message || "Network error occurred",
          isNetworkError: true,
          isRetryable: attempt < MAX_RETRIES - 1
        };
      }
      
      // Don't retry on the last attempt
      if (attempt === MAX_RETRIES - 1) {
        break;
      }
    }
    
    // Exponential backoff with jitter
    const baseDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
    const jitter = Math.random() * 0.1 * baseDelay;
    const delay = baseDelay + jitter;
    
    console.warn(`API request failed (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${Math.round(delay)}ms...`, lastError);
    await sleep(delay);
  }
  
  // All retries exhausted - throw the last error
  throw lastError;
}

/**
 * Clear cache (useful for testing or manual cache clearing)
 */
export function clearZineCache(): void {
  responseCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let active = 0;
  let expired = 0;
  
  for (const entry of responseCache.values()) {
    if (entry.expiresAt >= now) {
      active++;
    } else {
      expired++;
    }
  }
  
  return {
    totalEntries: responseCache.size,
    activeEntries: active,
    expiredEntries: expired,
  };
}