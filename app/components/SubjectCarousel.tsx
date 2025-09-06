/**
 * @fileoverview Rotating subject carousel for empty state inspiration
 * 
 * Displays rotating creative subjects from our constants to inspire users
 * and demonstrate the variety of zines that can be created.
 * 
 * Features:
 * - Rotates through random subjects every 3 seconds
 * - Clickable subjects populate the input field
 * - Subtle typewriter effect on transitions
 * - Pauses rotation on hover for accessibility
 * - Bold neobrutalist typography matching app aesthetic
 * - Respects reduced motion preferences
 * 
 * @example
 * ```tsx
 * <SubjectCarousel 
 *   onSubjectSelect={(subject) => setInputValue(subject)}
 * />
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SUBJECTS } from '@/app/constants';

/**
 * Props interface for SubjectCarousel component
 */
interface SubjectCarouselProps {
  /** 
   * Callback when user clicks on a rotating subject
   * Should populate the input field with the selected subject
   */
  onSubjectSelect: (subject: string) => void;
}

/**
 * Get a random selection of subjects for the carousel
 * @param count Number of subjects to select
 * @returns Array of random subjects
 */
function getRandomSubjects(count: number): string[] {
  const shuffled = [...SUBJECTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Rotating subject carousel component
 * 
 * @description Creates inspiring, interactive subject rotation:
 * - Shows "CRAFT A ZINE ABOUT..." followed by rotating subject
 * - Cycles through 8 random subjects every 3 seconds
 * - Clicking subject populates input and starts generation
 * - Hover pauses rotation for user convenience
 * - Maintains consistent neobrutalist typography
 * 
 * @param {SubjectCarouselProps} props Component configuration
 * @returns {JSX.Element} Subject carousel with rotating inspiration
 */
export default function SubjectCarousel({ onSubjectSelect }: SubjectCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [subjects] = useState(() => getRandomSubjects(50)); // 50 rotating subjects for much more variety
  const [isTyping, setIsTyping] = useState(false);

  const currentSubject = subjects[currentIndex];

  // Rotate to next subject
  const rotateSubject = useCallback(() => {
    if (!isPaused) {
      setIsTyping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % subjects.length);
        setIsTyping(false);
      }, 300); // Smoother transition duration
    }
  }, [isPaused, subjects.length]);

  // Auto-rotation effect
  useEffect(() => {
    const interval = setInterval(rotateSubject, 5000); // Slower rotation for better readability
    return () => clearInterval(interval);
  }, [rotateSubject]);

  // Handle subject selection
  const handleSubjectClick = () => {
    onSubjectSelect(currentSubject);
  };

  // Pause/resume on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div className="text-center space-y-4">
      {/* Main heading */}
      <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-black">
        CRAFT A ZINE ABOUT
      </h2>
      
      {/* Rotating subject */}
      <div
        className={`
          relative cursor-pointer transition-all duration-300
          hover:transform hover:-translate-y-1
          ${isTyping ? 'opacity-0' : 'opacity-100'}
        `}
        onClick={handleSubjectClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="
          inline-block px-6 py-3 
          bg-gradient-to-r from-fuchsia-400 via-yellow-200 to-lime-300
          border-2 border-black
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          text-black font-bold text-lg md:text-xl uppercase tracking-wide
        ">
          {currentSubject}
        </div>
        
        </div>
    </div>
  );
}