// Content sanitization utilities for AI-generated content security

import DOMPurify from 'dompurify';

/**
 * Configuration for DOMPurify to ensure safe content rendering
 * Focuses on text-only content with basic formatting
 */
const SANITIZATION_CONFIG = {
  // Only allow safe text content and basic formatting
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'i', 'b', 'u'],
  ALLOWED_ATTR: [],
  // Keep content as close to original as possible while ensuring safety
  KEEP_CONTENT: true,
  // Don't allow any attributes to prevent attribute-based XSS
  FORBID_ATTR: ['style', 'class', 'id', 'onclick', 'onload', 'onerror'],
  // Return text only for maximum safety
  USE_PROFILES: { html: false },
};

/**
 * Sanitize text content from AI-generated responses
 * Removes HTML tags and potentially dangerous content while preserving text formatting
 */
export function sanitizeTextContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // For client-side rendering, we need to handle DOMPurify carefully
  if (typeof window === 'undefined') {
    // Server-side: return the content as-is since we're using text-only rendering
    // The real sanitization will happen client-side
    return content.trim();
  }

  try {
    // Client-side: use DOMPurify to sanitize
    const sanitized = DOMPurify.sanitize(content.trim(), {
      ...SANITIZATION_CONFIG,
      // Return text only for maximum security
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    
    return sanitized;
  } catch (error) {
    console.warn('Content sanitization failed, using fallback:', error);
    // Fallback: basic string cleaning
    return cleanTextFallback(content);
  }
}

/**
 * Sanitize array content (like fun facts)
 */
export function sanitizeArrayContent(content: string[]): string[] {
  if (!Array.isArray(content)) {
    return [];
  }

  return content
    .filter(item => typeof item === 'string' && item.trim().length > 0)
    .map(item => sanitizeTextContent(item))
    .filter(item => item.length > 0);
}

/**
 * Fallback text cleaning for when DOMPurify fails
 * Basic protection against common XSS patterns
 */
function cleanTextFallback(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  return content
    .trim()
    // Remove script tags and their content first
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove other dangerous tags and their content
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove data: URLs
    .replace(/data:/gi, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate that content doesn't contain suspicious patterns
 * Additional layer of protection beyond sanitization
 */
export function validateContentSafety(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return true; // Empty content is safe
  }

  // Patterns that should never appear in sanitized content
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /<style/i,
  ];

  return !suspiciousPatterns.some(pattern => pattern.test(content));
}

/**
 * Comprehensive content sanitization for zine sections
 * Applies appropriate sanitization based on content type
 */
export function sanitizeZineContent(content: string | string[]): string | string[] {
  if (Array.isArray(content)) {
    return sanitizeArrayContent(content);
  } else {
    const sanitized = sanitizeTextContent(content);
    
    // Validate the sanitized content
    if (!validateContentSafety(sanitized)) {
      console.warn('Content failed safety validation after sanitization');
      return 'Content removed for security reasons';
    }
    
    return sanitized;
  }
}

/**
 * Get sanitization statistics for monitoring
 */
export function getSanitizationStats() {
  return {
    dompurifyAvailable: typeof DOMPurify !== 'undefined',
    isClientSide: typeof window !== 'undefined',
    version: '1.0.0',
  };
}