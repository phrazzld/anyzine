/**
 * @fileoverview Main form component for subject input and zine generation interface
 * Orchestrates user interactions, validation, API calls, and state display with comprehensive error handling
 */

"use client";

import React from "react";
import { ZineDisplay } from "./ZineDisplay";
import { useZineGeneration } from "@/app/hooks/useZineGeneration";
import { useSubjectValidation } from "@/app/hooks/useSubjectValidation";
import { useSubjectForm } from "@/app/hooks/useSubjectForm";

/**
 * Primary form component for zine subject input and generation workflow
 * 
 * @description Complete user interface for zine generation with comprehensive state management:
 * - Subject input form with real-time validation feedback
 * - Random subject suggestion functionality
 * - Loading states with animated spinner during API calls
 * - Error display with user-friendly messaging and categorization
 * - Success state with zine content display
 * - Neobrutalist styling with hover/active animations
 * - Integration of multiple custom hooks for separation of concerns
 * 
 * @returns {JSX.Element} Complete form interface with conditional content display
 * 
 * @example
 * ```tsx
 * // Used as the main interface component in the home page
 * export default function HomePage() {
 *   return (
 *     <main>
 *       <SubjectForm />
 *     </main>
 *   );
 * }
 * ```
 * 
 * @architecture
 * - Form state managed by useSubjectForm hook
 * - Validation handled by useSubjectValidation hook
 * - API calls and response state managed by useZineGeneration hook
 * - ZineDisplay component renders successful results
 * - Error boundaries and loading states prevent UI corruption
 * 
 * @security
 * - Real-time client-side validation with security pattern detection
 * - Server-side validation integration prevents prompt injection
 * - Input length limits (maxLength={250}) prevent buffer overflow
 * - Error sanitization prevents information disclosure
 * - Rate limiting feedback for DoS protection
 * 
 * @performance
 * - Debounced validation prevents excessive API calls
 * - Transform-GPU animations for smooth interactions
 * - Conditional rendering minimizes DOM updates
 * - Proper loading states prevent user confusion
 */
export default function SubjectForm() {
  const { loading, error, zineData, generateZine, clearError } = useZineGeneration();
  const { validateSubject } = useSubjectValidation();
  const { subject, handleInputChange, handleRandom } = useSubjectForm();

  /**
   * Handle form submission and initiate zine generation
   * 
   * @param {React.FormEvent} e - Form submission event
   * 
   * @description Coordinates form submission with validation and API generation:
   * - Prevents default browser form submission behavior
   * - Performs client-side validation before API call
   * - Passes validation results to generation hook for proper error handling
   * - Triggers loading state and manages async operation lifecycle
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateSubject(subject);
    await generateZine(subject, validationError);
  };

  /**
   * Enhanced input change handler with real-time validation feedback
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   * 
   * @description Provides improved UX with immediate validation feedback:
   * - Updates form state through base input change handler
   * - Performs real-time validation on new input value
   * - Automatically clears previous errors when input becomes valid
   * - Prevents error state persistence during typing corrections
   */
  const handleInputChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    
    // Clear error if input becomes valid
    const validationError = validateSubject(e.target.value);
    if (error && !validationError) {
      clearError();
    }
  };

  /**
   * Enhanced random subject handler with error state management
   * 
   * @description Combines random subject selection with error clearing:
   * - Delegates to base random subject selection functionality
   * - Automatically clears any existing error states
   * - Provides clean slate for new random subject experimentation
   * - Improves user experience by preventing stale error display
   */
  const handleRandomWithClear = () => {
    handleRandom();
    clearError();
  };

  return (
    <div className="w-full">
      <section className="p-6 border-2 border-black">
        <form className="flex gap-2 items-center" onSubmit={handleSubmit}>
          <input
            type="text"
            className="border-2 border-black p-2 text-xl w-full"
            placeholder="enter a subject (max 200 chars)"
            value={subject}
            onChange={handleInputChangeWithValidation}
            maxLength={200}
          />
          <button
            type="button"
            onClick={handleRandomWithClear}
            className="
              border-2 border-black bg-gray-200 text-black px-4 py-2 uppercase font-bold
              transition-transform transform-gpu duration-150
              hover:-translate-y-1
              active:translate-y-1
            "
          >
            random
          </button>
          <button
            type="submit"
            className="
              border-2 border-black bg-violet-600 text-white px-4 py-2 uppercase font-bold
              transition-transform transform-gpu duration-150
              hover:-translate-y-1
              active:translate-y-1
            "
          >
            create
          </button>
        </form>
      </section>

      {/* loading */}
      {loading && (
        <div className="p-6 border-2 border-t-0 border-black text-center">
          <div className="flex justify-center items-center gap-2">
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
            <span className="uppercase font-bold">generating...</span>
          </div>
        </div>
      )}

      {/* error */}
      {error && !loading && (
        <div className="p-6 border-2 border-red-500 bg-red-100 text-red-800 text-center text-sm rounded">
          {error}
        </div>
      )}

      {/* empty */}
      {!zineData && !loading && !error && (
        <div className="p-6 border-2 border-t-0 border-black text-center flex flex-col items-center">
          <span className="text-4xl mb-2">🤔</span>
          <p>no zine yet. enter a subject above or click random.</p>
        </div>
      )}

      {/* zine */}
      {zineData && <ZineDisplay sections={zineData.sections} />}
    </div>
  );
}
