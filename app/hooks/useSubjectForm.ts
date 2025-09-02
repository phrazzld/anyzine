/**
 * @fileoverview Custom React hook for managing subject form state and interactions
 * Handles user input, random subject selection, and form state management
 */

import { useState } from "react";
import { SUBJECTS } from "@/app/constants";

/**
 * Hook for managing subject input form state and interactions
 * 
 * @description Provides form state management and user interaction handlers:
 * - Subject input state management with controlled input pattern
 * - Random subject selection from curated subject list
 * - Input change handling with proper event typing
 * - Integration with predefined subject constants
 * 
 * @returns {object} Hook interface with state and handlers
 * @returns {string} returns.subject - Current subject input value
 * @returns {function} returns.setSubject - Direct subject state setter
 * @returns {function} returns.handleInputChange - Input change event handler
 * @returns {function} returns.handleRandom - Random subject selection handler
 * 
 * @example
 * ```tsx
 * const { subject, handleInputChange, handleRandom } = useSubjectForm();
 * 
 * return (
 *   <div>
 *     <input value={subject} onChange={handleInputChange} />
 *     <button onClick={handleRandom}>Random Subject</button>
 *   </div>
 * );
 * ```
 * 
 * @sideEffects
 * - Updates component state triggering re-renders
 * - No external API calls or side effects
 * - Pure state management operations
 */
export const useSubjectForm = () => {
  const [subject, setSubject] = useState("");

  /**
   * Handle input change events from the subject text field
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   * 
   * @description Extracts new value from input event and updates subject state:
   * - Follows controlled component pattern for React forms
   * - No validation or sanitization (handled by separate validation hook)
   * - Triggers immediate state update and re-render
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSubject(newValue);
  };

  /**
   * Select a random subject from the predefined subjects list
   * 
   * @description Randomly selects from curated subject suggestions:
   * - Uses Math.random() for uniform distribution selection
   * - Selects from SUBJECTS constant array (imported from constants)
   * - Immediately updates subject state with selected value
   * - Provides user discovery of interesting topics
   */
  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * SUBJECTS.length);
    setSubject(SUBJECTS[randomIndex]);
  };

  return {
    subject,
    setSubject,
    handleInputChange,
    handleRandom,
  };
};