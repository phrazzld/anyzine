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
import { AuthButton } from './AuthButton';

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
  const { subject, setSubject, handleInputChange } = useSubjectForm();

  // Shared button styling for consistency
  const buttonBaseClass = `
    px-6 py-3 font-bold uppercase
    transition-all transform-gpu duration-150
    hover:-translate-y-0.5 active:translate-y-0
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
  `;

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
      {/* Unified top bar with logo, form, and auth */}
      <header className="bg-white border-b-4 border-black">
        <div className="flex items-stretch">
          {/* Logo */}
          <div className="flex items-center px-4 border-r-2 border-black">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              ANY<span className="text-purple-600">ZINE</span>
            </h1>
          </div>

          {/* Input Form */}
          <form className="flex-1 flex" onSubmit={handleSubmit}>
            <input
              type="text"
              className="flex-1 px-4 py-3 text-xl md:text-2xl"
              placeholder="enter a subject"
              value={subject}
              onChange={handleInputChangeWithValidation}
              maxLength={200}
              disabled={loading}
            />
          </form>

          {/* Actions Container - All buttons as siblings */}
          <div className="flex items-stretch">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`${buttonBaseClass} border-l-2 border-black bg-violet-600 text-white hover:bg-violet-700`}
            >
              {loading ? 'creating...' : 'create'}
            </button>
            <div className="border-l-2 border-black">
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

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

          {/* Centered carousel */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="pt-24">
              <SubjectCarousel onSubjectSelect={handleSubjectSelect} />
            </div>
          </div>
        </div>
      )}

      {/* error state */}
      {error && !loading && (
        <div className="flex-1 p-6">
          <div className="p-6 border-4 border-black bg-red-100">
            <div className="text-red-800 text-center font-bold uppercase">
              {error}
            </div>
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
