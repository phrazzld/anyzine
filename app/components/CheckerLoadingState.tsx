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
 * Empty state grid component - shows when no content is loading
 * Uses deterministic pattern to avoid hydration issues
 */
export function EmptyStateGrid() {
  const cellCount = 64; // 8x8 grid
  const colors = [
    'var(--checker-color-1, #c026d3)', // fuchsia
    'var(--checker-color-2, #fef08a)', // yellow
    'var(--checker-color-3, #bef264)'  // lime
  ];
  
  const cells = Array.from({ length: cellCount }, (_, index) => {
    // Deterministic color selection based on index
    const colorIndex = index % 3;
    const backgroundColor = colors[colorIndex];
    
    // Deterministic delay based on position for wave effect
    const row = Math.floor(index / 8);
    const col = index % 8;
    const delay = (row + col) * 0.1;
    
    // Deterministic animation duration variation
    const duration = 1 + (index % 3) * 0.5;
    
    // Some cells pulse, others don't (deterministic based on index)
    const shouldPulse = index % 5 < 3;
    
    return (
      <div
        key={index}
        className={`aspect-square ${shouldPulse ? 'empty-pulse' : ''}`}
        style={{
          backgroundColor,
          opacity: 0.08,
          '--pulse-delay': `${delay}s`,
          '--pulse-duration': `${duration}s`,
          '--pop-delay': index % 7 === 0 ? `${delay * 2}s` : 'none'
        } as React.CSSProperties}
      />
    );
  });
  
  return (
    <div className="absolute inset-0 grid grid-cols-8 gap-0 opacity-30">
      {cells}
    </div>
  );
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

  // Simple deterministic grid pattern
  const cellCount = 240; // 12x20 mobile, 20x12 desktop
  const checkerCells = Array.from({ length: cellCount }, (_, index) => {
    // Deterministic pattern based on index
    const colorClass = index % 3 === 0 ? 'checker-1' : 
                      index % 3 === 1 ? 'checker-2' : 'checker-3';
    
    // Create wave effect with CSS animation delay
    const row = Math.floor(index / 20);
    const col = index % 20;
    const animationDelay = `${(row + col) * 0.05}s`;
    
    return (
      <div
        key={index}
        className={`aspect-square checker-cell ${colorClass} ${hasError ? 'checker-fade-out' : ''}`}
        style={{
          animationDelay
        }}
      />
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Full viewport checker grid */}
      <div className="grid grid-cols-12 md:grid-cols-20 gap-0 w-full h-full">
        {checkerCells}
      </div>
      
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