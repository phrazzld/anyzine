/**
 * @fileoverview Neobrutalist checker-pattern loading state component
 * Displays animated 8x8 checker grid with retro styling and dynamic colors
 */

import React, { useState, useEffect } from 'react';

/**
 * Props interface for CheckerLoadingState component
 */
interface CheckerLoadingStateProps {
  /** Array of CSS color values (defaults to dynamic CSS custom properties) */
  colors?: string[];
  /** Status message to display over the checker pattern */
  message?: string;
  /** Whether the component is currently visible */
  isVisible?: boolean;
  /** Whether an error state is present (triggers fade-out transition) */
  hasError?: boolean;
}

/**
 * Neobrutalist checker-pattern loading state component
 * 
 * @description Renders a responsive animated checker grid with retro tech aesthetics:
 * - Uses existing neobrutalist color palette (fuchsia-400, yellow-200, lime-300)
 * - Implements responsive CSS Grid layout (6x6 mobile, 8x8 desktop)
 * - Provides foundation for CSS keyframe animations
 * - Smooth error state transitions with 150ms fade-out
 * - Maintains consistency with existing loading state positioning
 * 
 * @param {CheckerLoadingStateProps} props Component configuration
 * @returns {JSX.Element} Checker pattern loading state
 * 
 * @example
 * ```tsx
 * <CheckerLoadingState 
 *   message="CRAFTING YOUR DIGITAL ZINE..."
 *   isVisible={loading}
 * />
 * // Colors automatically sourced from CSS custom properties
 * // --checker-color-1, --checker-color-2, --checker-color-3
 * ```
 */
export default function CheckerLoadingState({ 
  colors = ['var(--checker-color-1, #c026d3)', 'var(--checker-color-2, #fef08a)', 'var(--checker-color-3, #bef264)'],
  message = 'GENERATING...',
  isVisible = true,
  hasError = false
}: CheckerLoadingStateProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Handle transition to error state
  useEffect(() => {
    if (hasError && isVisible) {
      setIsTransitioning(true);
      // Start fade-out transition (duration matches pattern: 150ms)
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    } else if (!hasError) {
      setIsTransitioning(false);
    }
  }, [hasError, isVisible]);
  
  if (!isVisible && !isTransitioning) return null;

  // Generate responsive checker cells (36 for mobile 6x6, 64 for desktop 8x8)
  // Use max count of 64 and let CSS grid handle responsive display
  const checkerCells = Array.from({ length: 64 }, (_, index) => {
    // Cycle through colors for varied checker pattern
    const colorIndex = index % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return (
      <div
        key={index}
        className="
          aspect-square
          border-2 border-black
          checker-cell
          hidden md:block
        "
        style={{
          '--cell-index': index,
          backgroundColor: backgroundColor,
        } as React.CSSProperties}
      />
    );
  });

  // Generate mobile cells (first 36 cells visible on mobile)
  const mobileCells = checkerCells.slice(0, 36).map((cell) => 
    React.cloneElement(cell, {
      ...cell.props,
      className: cell.props.className.replace('hidden md:block', 'block md:hidden')
    })
  );

  return (
    <div className={`p-6 border-2 border-t-0 border-black ${hasError ? 'checker-fade-out' : ''}`}>
      {/* Checker grid container */}
      <div className="relative">
        {/* Responsive Checker grid: 6x6 mobile, 8x8 desktop */}
        <div className="grid grid-cols-6 md:grid-cols-8 gap-0.5 md:gap-1 w-full max-w-sm md:max-w-md mx-auto">
          {mobileCells}
          {checkerCells}
        </div>
        
        {/* Status message overlay */}
        {message && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="
              text-lg font-bold uppercase tracking-widest
              text-white bg-black/90 px-4 py-2 border-2 border-black
              shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
            ">
              {message}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}