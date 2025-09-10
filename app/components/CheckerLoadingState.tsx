/**
 * @fileoverview Neobrutalist checker-pattern loading state component
 * 
 * A performant, GPU-accelerated loading animation featuring an animated checker grid
 * with retro styling. Designed for the AnyZine application's neobrutalist aesthetic.
 * 
 * Features:
 * - CSS-only animations (no hydration issues)
 * - Full viewport coverage with responsive grid
 * - Deterministic pattern based on cell index
 * - GPU-optimized animations (60fps performance)
 * - Smooth error state transitions
 * - Retro text overlay with neobrutalist typography
 */

'use client';

import React, { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyStateGrid from './EmptyStateGrid';

interface CheckerLoadingStateProps {
  /** Status message displayed over the checker pattern */
  message?: string;
  /** Subject of the zine being generated */
  subject?: string;
  /** Controls component visibility */
  isVisible?: boolean;
  /** Triggers error state transition */
  hasError?: boolean;
}

/**
 * Neobrutalist checker-pattern loading state component
 * 
 * Uses CSS-only animations to avoid hydration issues
 * Provides smooth, performant loading experience
 */
export default function CheckerLoadingState({ 
  message,
  subject = '',
  isVisible = true,
  hasError = false
}: CheckerLoadingStateProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Generate display message
  const displayMessage = message || (
    subject.trim() 
      ? `CRAFTING YOUR DIGITAL ZINE ABOUT ${subject.toUpperCase()}...`
      : 'CRAFTING YOUR DIGITAL ZINE...'
  );
  
  // Detect user's motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  if (!isVisible) return null;

  // Fallback to simple spinner for users who prefer reduced motion
  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-2">
        <LoadingSpinner />
        {displayMessage && (
          <span className="text-lg font-bold uppercase tracking-widest text-black">
            {displayMessage}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 bg-white ${hasError ? 'checker-fade-out' : ''}`}>
      {/* Full viewport checker grid using the same component as the empty/default state */}
      <EmptyStateGrid />

      {/* Status message overlay */}
      {displayMessage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="
            text-xl md:text-2xl font-bold uppercase tracking-widest
            text-white bg-black/90 px-6 py-3 border-2 border-black
            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          ">
            {displayMessage}
          </span>
        </div>
      )}
    </div>
  );
}
