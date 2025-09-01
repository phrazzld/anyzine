/**
 * @fileoverview Custom React hook for client-side subject validation with security integration
 * Provides real-time validation feedback while maintaining compatibility with server-side security measures
 */

import { validateAndSanitizeSubject } from "@/app/utils/validation";

/**
 * Hook for subject input validation with user-friendly error messaging
 * 
 * @description Integrates client-side validation with server-side security validation:
 * - Real-time validation feedback for better user experience
 * - Security pattern detection (prompt injection, XSS attempts, etc.)
 * - Error message transformation for consistent UI messaging
 * - Backward compatibility with existing validation patterns
 * - Integration with comprehensive server-side validation utility
 * 
 * @returns {object} Hook interface with validation functions
 * @returns {function} returns.validateSubject - Validate input and return error message or null
 * @returns {function} returns.isValidSubject - Boolean validation check
 * 
 * @example
 * ```tsx
 * const { validateSubject, isValidSubject } = useSubjectValidation();
 * 
 * const handleInputChange = (value: string) => {
 *   const error = validateSubject(value);
 *   setError(error);
 *   
 *   if (isValidSubject(value)) {
 *     // Enable submit button
 *   }
 * };
 * ```
 * 
 * @security
 * - Uses same validation patterns as server-side for consistency
 * - Detects prompt injection attempts with 14+ security patterns
 * - Prevents dangerous character sequences and HTML injection
 * - Length validation prevents buffer overflow and DoS attempts
 * - Client-side validation is supplemented by server-side validation
 */
export const useSubjectValidation = () => {
  /**
   * Validate subject input and return user-friendly error message
   * 
   * @param {string} input - Subject text to validate
   * @returns {string|null} Error message for invalid input, null if valid
   * 
   * @description Performs comprehensive validation and transforms technical error messages:
   * - Integrates with server-side security validation utility
   * - Maps technical validation errors to user-friendly messages
   * - Maintains backward compatibility with existing UI error patterns
   * - Handles length validation (2-200 characters)
   * - Detects security threats (prompt injection, XSS, etc.)
   */
  const validateSubject = (input: string): string | null => {
    const result = validateAndSanitizeSubject(input);
    
    if (!result.isValid) {
      // Transform server-side error messages to match original client-side messages
      const serverError = result.error || "Invalid input";
      
      // Map server messages to client messages for backward compatibility
      if (serverError.includes("non-empty string") || serverError.includes("cannot be empty")) {
        return "please enter a subject";
      }
      if (serverError.includes("at least 2 characters")) {
        return "subject must be at least 2 characters";
      }
      if (serverError.includes("200 characters or less")) {
        return "subject must be 200 characters or less";
      }
      if (serverError.includes("invalid characters") || serverError.includes("invalid patterns")) {
        return "subject contains invalid patterns";
      }
      
      // Fallback to lowercase server message
      return serverError.toLowerCase();
    }
    
    return null;
  };

  /**
   * Simple boolean validation check for subject input
   * 
   * @param {string} input - Subject text to validate
   * @returns {boolean} True if valid, false if invalid
   * 
   * @description Lightweight validation check for conditional logic:
   * - Uses same validation logic as validateSubject
   * - Useful for enabling/disabling submit buttons
   * - No error message generation for performance
   */
  const isValidSubject = (input: string): boolean => {
    const result = validateAndSanitizeSubject(input);
    return result.isValid;
  };

  return {
    validateSubject,
    isValidSubject,
  };
};