// Input validation and prompt injection protection utilities

export interface ValidationResult {
  isValid: boolean;
  sanitized?: string;
  error?: string;
}

/**
 * Comprehensive input validation and prompt injection protection
 * Validates and sanitizes user input for AI prompt generation
 */
export function validateAndSanitizeSubject(input: unknown): ValidationResult {
  // Type validation
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Subject must be a non-empty string' };
  }

  const trimmed = input.trim();
  
  // Length validation
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Subject cannot be empty' };
  }
  if (trimmed.length > 200) {
    return { isValid: false, error: 'Subject must be 200 characters or less' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Subject must be at least 2 characters' };
  }

  // Prompt injection protection patterns
  const dangerousPatterns = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
    /forget\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
    /disregard\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
    /you\s+are\s+(now\s+)?a\s+/i,
    /pretend\s+(you\s+are|to\s+be)/i,
    /roleplay\s+as/i,
    /act\s+as\s+(if\s+you\s+are\s+)?a\s+/i,
    /system\s*[:.]?\s*(prompt|message|instruction)/i,
    /new\s+instructions?/i,
    /override\s+(previous\s+)?instructions?/i,
    /jailbreak/i,
    /prompt\s*[:.]?\s*end/i,
    /\[?\s*system\s*\]?/i,
    /\[?\s*(user|human|assistant)\s*\]?/i,
    /```[\s\S]*?```/,  // Code blocks
    /^\s*[{}\[\]]/,     // Starts with JSON/array characters
  ];

  // Check for prompt injection patterns
  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      return { isValid: false, error: 'Subject contains invalid characters or patterns' };
    }
  }

  // Character filtering - remove potentially dangerous characters
  const sanitized = trimmed
    .replace(/[<>{}]/g, '') // Remove HTML/template delimiters
    .replace(/[`'"]/g, '')  // Remove quotes that could break prompts
    .replace(/\$/g, '')     // Remove template literal indicators
    .replace(/\\\\/g, '')   // Remove escape sequences
    .trim();

  // Final length check after sanitization
  if (sanitized.length === 0) {
    return { isValid: false, error: 'Subject contains only invalid characters' };
  }

  return { isValid: true, sanitized };
}