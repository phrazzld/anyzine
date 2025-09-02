/**
 * @fileoverview Custom React hook for managing zine generation with resilient API integration
 * Handles loading states, error categorization, and response caching with comprehensive error recovery
 */

import { useState } from "react";
import { TZineSection } from "@/app/components/ZineDisplay";
import { resilientZineGeneration, clearZineCache } from "@/app/utils/api-resilience";

/**
 * Hook for managing zine generation with comprehensive error handling and state management
 * 
 * @description Provides complete zine generation workflow with resilient API integration:
 * - Loading state management during API calls
 * - Comprehensive error categorization and user-friendly messaging
 * - Response caching with cache management utilities
 * - Integration with server-side validation and security measures
 * - Automatic retry logic with exponential backoff
 * 
 * @returns {object} Hook interface with state and control functions
 * @returns {boolean} returns.loading - True during API request, false otherwise
 * @returns {string|null} returns.error - Error message or null if no error
 * @returns {object|null} returns.zineData - Generated zine with sections array or null
 * @returns {function} returns.generateZine - Async function to generate zine from subject
 * @returns {function} returns.clearError - Clear current error state
 * @returns {function} returns.clearCache - Clear cached API responses
 * 
 * @example
 * ```tsx
 * const { loading, error, zineData, generateZine, clearError } = useZineGeneration();
 * 
 * const handleSubmit = async () => {
 *   await generateZine('coffee culture');
 *   if (zineData) {
 *     // Handle successful generation
 *   }
 * };
 * ```
 * 
 * @sideEffects
 * - Makes HTTP requests to /api/generate-zine endpoint
 * - Manages in-memory response cache (1-hour TTL)
 * - Console logging for error tracking
 * - Updates component state triggering re-renders
 * 
 * @security
 * - Integrates with server-side validation to handle pre-validated input
 * - Respects rate limiting (10 requests/minute per IP)
 * - Error messages sanitized to prevent information disclosure
 * - Validation errors handled separately from API errors
 */
export const useZineGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [zineData, setZineData] = useState<{ sections: TZineSection[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a digital zine from a subject with comprehensive error handling
   * 
   * @param {string} subject - The topic for zine generation (will be trimmed)
   * @param {string|null} [validationError] - Pre-validation error to display instead of API call
   * 
   * @description Orchestrates the complete zine generation workflow:
   * - Handles pre-validation errors from client-side validation
   * - Resets state (error, loading, previous data) before API call
   * - Uses resilient API client with retry logic and caching
   * - Categorizes errors into user-friendly messages (rate limit, timeout, network, server)
   * - Maintains loading state throughout async operation
   */
  const generateZine = async (subject: string, validationError?: string | null) => {
    // Handle validation errors
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    setLoading(true);
    setZineData(null);

    try {
      const data = await resilientZineGeneration(subject.trim());
      setZineData(data);
    } catch (err: any) {
      console.error("Zine generation failed:", err);
      
      // Handle different types of errors with specific messaging
      if (err?.isRateLimit) {
        setError(err.message);
      } else if (err?.isTimeout) {
        setError("Request timed out. Please try again.");
      } else if (err?.isNetworkError) {
        setError("Network error. Check your connection and try again.");
      } else if (err?.status >= 500) {
        setError("Server error. Please try again in a moment.");
      } else {
        setError(err?.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear the current error state to hide error messages
   * @description Resets error state to null, typically called when user acknowledges error
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Clear the in-memory API response cache for fresh requests
   * @description Forces next API call to bypass cache, useful for testing or cache invalidation
   */
  const clearCache = () => {
    clearZineCache();
  };

  return {
    loading,
    error,
    zineData,
    generateZine,
    clearError,
    clearCache,
  };
};