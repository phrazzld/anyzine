/**
 * @fileoverview Subtle animated grid background for empty state
 * 
 * A gentle 4x4 grid animation that provides visual continuity with the loading state
 * while remaining unobtrusive and non-distracting for the empty state.
 * 
 * Features:
 * - 4x4 grid layout (16 cells total) for subtle background presence
 * - Very low opacity (5-10%) to avoid visual competition with content
 * - Random animation delays and occasional "pop" effects for organic feel
 * - Uses same color palette as loading state for visual consistency
 * - CSS-only animations for optimal performance
 * - Respects reduced motion preferences
 * 
 * @example
 * ```tsx
 * <div className="relative">
 *   <EmptyStateGrid />
 *   <div className="relative z-10">
 *     Content above grid
 *   </div>
 * </div>
 * ```
 */

import React from 'react';

/**
 * Default colors matching the main color palette
 * Same as CheckerLoadingState but used at much lower opacity
 */
const GRID_COLORS = [
  'var(--checker-color-1, #c026d3)', // fuchsia-400
  'var(--checker-color-2, #fef08a)', // yellow-200  
  'var(--checker-color-3, #bef264)'  // lime-300
];

/**
 * Subtle animated grid background component
 * 
 * @description Creates a gentle living canvas effect behind empty state content:
 * - 4x4 grid of large squares (not overwhelming like 240-cell loading grid)
 * - Cells pulse at 5% opacity with occasional 20% "pop" animations
 * - Random delays create organic, non-repetitive patterns
 * - Maintains visual connection to loading state without distraction
 * 
 * @returns {JSX.Element} Background grid animation
 */
export default function EmptyStateGrid() {
  // Handler to change cell color on each animation iteration
  const handleAnimationIteration = (e: React.AnimationEvent<HTMLDivElement>) => {
    const newColorIndex = Math.floor(Math.random() * GRID_COLORS.length);
    e.currentTarget.style.backgroundColor = GRID_COLORS[newColorIndex];
  };
  
  // Generate 240 cells to match loading state grid
  const gridCells = Array.from({ length: 240 }, (_, index) => {
    // Random color from palette
    const colorIndex = Math.floor(Math.random() * GRID_COLORS.length);
    const backgroundColor = GRID_COLORS[colorIndex];
    
    // Faster animation properties for snappier feel
    const pulseDelay = Math.random() * 2; // 0-2s delay (faster)
    const pulseDuration = 1 + Math.random() * 1; // 1-2s duration (faster)
    
    // Random chance for occasional "pop" animation
    const hasPopAnimation = Math.random() < 0.3; // 30% of cells
    const popDelay = pulseDelay + Math.random() * 4; // Offset from pulse (faster)
    
    return (
      <div
        key={index}
        className="aspect-square empty-pulse"
        style={{
          backgroundColor,
          opacity: 0.08, // Increased opacity for more prominence
          '--pulse-delay': `${pulseDelay}s`,
          '--pulse-duration': `${pulseDuration}s`,
          '--pop-delay': hasPopAnimation ? `${popDelay}s` : 'none',
        } as React.CSSProperties}
        onAnimationIteration={handleAnimationIteration}
      />
    );
  });

  return (
    <div className="absolute inset-0 grid grid-cols-12 md:grid-cols-20 gap-0 pointer-events-none">
      {gridCells}
    </div>
  );
}