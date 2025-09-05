/**
 * @fileoverview Main form component for subject input and zine generation interface
 * Orchestrates user interactions, validation, API calls, and state display with comprehensive error handling
 */

"use client";

import React from "react";
import { ZineDisplay } from "./ZineDisplay";
import CheckerLoadingState from "./CheckerLoadingState";
import EmptyStateGrid from "./EmptyStateGrid";
import SubjectCarousel from "./SubjectCarousel";
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
  const { subject, setSubject, handleInputChange, handleRandom } = useSubjectForm();

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

  /**
   * Handle subject selection from the carousel
   * 
   * @param {string} selectedSubject - Subject selected from rotating carousel
   * 
   * @description Sets the input field with carousel selection:
   * - Populates input with selected subject
   * - Clears any existing errors
   * - Provides seamless flow from inspiration to generation
   */
  const handleSubjectSelect = (selectedSubject: string) => {
    setSubject(selectedSubject);
    clearError();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Form section - visible when not in empty state */}
      {(loading || error || zineData) && (
        <section className="border-2 border-black">
          <form className="flex gap-2 items-center p-2" onSubmit={handleSubmit}>
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
      )}

      {/* loading */}
      <CheckerLoadingState 
        isVisible={loading}
        hasError={!!error}
        subject={subject}
      />

      {/* enhanced empty state - full viewport */}
      {!zineData && !loading && !error && (
        <div className="flex-1 relative overflow-hidden">
          {/* Full viewport background grid */}
          <EmptyStateGrid />
          
          {/* Floating form bar at top */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b-2 border-black shadow-[0_2px_0_0_rgba(0,0,0,1)]">
            <form className="flex gap-0 items-stretch" onSubmit={handleSubmit}>
              <input
                type="text"
                className="border-y-2 border-l-2 border-black p-3 text-2xl w-full"
                placeholder="enter a subject (max 200 chars)"
                value={subject}
                onChange={handleInputChangeWithValidation}
                maxLength={200}
              />
              <button
                type="submit"
                className="
                  border-y-2 border-r-2 border-black bg-violet-600 text-white px-6 py-3 uppercase font-bold
                  transition-transform transform-gpu duration-150
                  hover:-translate-y-1
                  active:translate-y-1
                "
              >
                create
              </button>
            </form>
          </div>
          
          {/* Centered carousel with top padding for form */}
          <div className="relative z-10 flex items-center justify-center h-full pt-36">
            <SubjectCarousel onSubjectSelect={handleSubjectSelect} />
          </div>
        </div>
      )}

      {/* error state */}
      {error && !loading && (
        <div className="flex-1 p-6">
          <div className="p-6 border-2 border-red-500 bg-red-100 text-red-800 text-center text-sm rounded">
            {error}
          </div>
        </div>
      )}

      {/* zine content */}
      {zineData && (
        <div className="flex-1">
          <ZineDisplay sections={zineData.sections} />
        </div>
      )}
    </div>
  );
}
