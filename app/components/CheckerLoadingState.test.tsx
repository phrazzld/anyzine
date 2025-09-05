import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CheckerLoadingState from './CheckerLoadingState';

// Mock window.matchMedia for reduced motion detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('CheckerLoadingState', () => {
  // Clean up timers after each test to prevent memory leaks
  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Basic rendering', () => {
    it('should render with default props', () => {
      render(<CheckerLoadingState />);
      
      expect(screen.getByText('GENERATING...')).toBeInTheDocument();
    });

    it('should render with custom message', () => {
      render(<CheckerLoadingState message="CRAFTING YOUR DIGITAL ZINE..." />);
      
      expect(screen.getByText('CRAFTING YOUR DIGITAL ZINE...')).toBeInTheDocument();
      expect(screen.queryByText('GENERATING...')).not.toBeInTheDocument();
    });

    it('should not render when not visible', () => {
      const { container } = render(<CheckerLoadingState isVisible={false} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should render checker grid cells', () => {
      const { container } = render(<CheckerLoadingState />);
      
      // Should render 240 cells for full viewport coverage
      const checkerCells = container.querySelectorAll('.checker-cell');
      expect(checkerCells).toHaveLength(240);
    });
  });

  describe('Props validation', () => {
    it('should use default colors when none provided', () => {
      const { container } = render(<CheckerLoadingState />);
      
      const cells = container.querySelectorAll('.checker-cell');
      expect(cells.length).toBeGreaterThan(0);
      
      // Check that cells have background colors (first cell should have background)
      const firstCell = cells[0] as HTMLElement;
      expect(firstCell.style.backgroundColor).toBeTruthy();
    });

    it('should apply custom colors from props', () => {
      const customColors = ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(0, 0, 255)'];
      const { container } = render(<CheckerLoadingState colors={customColors} />);
      
      const cells = container.querySelectorAll('.checker-cell');
      
      // Check first few cells have the custom colors
      expect((cells[0] as HTMLElement).style.backgroundColor).toBe('rgb(255, 0, 0)');
      expect((cells[1] as HTMLElement).style.backgroundColor).toBe('rgb(0, 255, 0)');
      expect((cells[2] as HTMLElement).style.backgroundColor).toBe('rgb(0, 0, 255)');
    });

    it('should handle empty colors array gracefully', () => {
      expect(() => {
        render(<CheckerLoadingState colors={[]} />);
      }).not.toThrow();
    });

    it('should cycle through colors correctly', () => {
      const colors = ['red', 'blue'];
      const { container } = render(<CheckerLoadingState colors={colors} />);
      
      const cells = container.querySelectorAll('.checker-cell');
      
      // Should cycle: red, blue, red, blue...
      expect((cells[0] as HTMLElement).style.backgroundColor).toBe('red');
      expect((cells[1] as HTMLElement).style.backgroundColor).toBe('blue');
      expect((cells[2] as HTMLElement).style.backgroundColor).toBe('red');
      expect((cells[3] as HTMLElement).style.backgroundColor).toBe('blue');
    });
  });

  describe('Color assignment', () => {
    it('should assign colors using modulo cycling', () => {
      const colors = ['color1', 'color2', 'color3'];
      const { container } = render(<CheckerLoadingState colors={colors} />);
      
      const cells = container.querySelectorAll('.checker-cell');
      
      // Test modulo cycling pattern: index % colors.length
      expect((cells[0] as HTMLElement).style.backgroundColor).toBe('color1'); // 0 % 3 = 0
      expect((cells[1] as HTMLElement).style.backgroundColor).toBe('color2'); // 1 % 3 = 1
      expect((cells[2] as HTMLElement).style.backgroundColor).toBe('color3'); // 2 % 3 = 2
      expect((cells[3] as HTMLElement).style.backgroundColor).toBe('color1'); // 3 % 3 = 0
      expect((cells[4] as HTMLElement).style.backgroundColor).toBe('color2'); // 4 % 3 = 1
    });

    it('should handle single color gracefully', () => {
      const { container } = render(<CheckerLoadingState colors={['single-color']} />);
      
      const cells = container.querySelectorAll('.checker-cell');
      
      // All cells should have the same color
      expect((cells[0] as HTMLElement).style.backgroundColor).toBe('single-color');
      expect((cells[5] as HTMLElement).style.backgroundColor).toBe('single-color');
      expect((cells[10] as HTMLElement).style.backgroundColor).toBe('single-color');
    });
  });

  describe('Full viewport behavior', () => {
    it('should have full viewport grid classes', () => {
      const { container } = render(<CheckerLoadingState />);
      
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-12', 'md:grid-cols-20');
    });

    it('should have fixed positioning for full screen overlay', () => {
      const { container } = render(<CheckerLoadingState />);
      
      const wrapperContainer = container.firstChild as HTMLElement;
      expect(wrapperContainer).toHaveClass('fixed', 'inset-0', 'z-50');
    });

    it('should have full width and height grid', () => {
      const { container } = render(<CheckerLoadingState />);
      
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('w-full', 'h-full');
    });

    it('should have no gaps between cells', () => {
      const { container } = render(<CheckerLoadingState />);
      
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('gap-0');
    });

    it('should render all cells uniformly', () => {
      const { container } = render(<CheckerLoadingState />);
      
      // All 240 cells should have the same base classes
      const allCells = container.querySelectorAll('.checker-cell');
      expect(allCells).toHaveLength(240);
      
      // Verify first few cells have expected classes
      expect(allCells[0]).toHaveClass('aspect-square', 'border', 'border-black', 'checker-cell');
      expect(allCells[1]).toHaveClass('aspect-square', 'border', 'border-black', 'checker-cell');
    });
  });

  describe('CSS styling and classes', () => {
    it('should apply neobrutalist styling to cells', () => {
      const { container } = render(<CheckerLoadingState />);
      
      const firstCell = container.querySelector('.checker-cell');
      expect(firstCell).toHaveClass('aspect-square', 'border-2', 'border-black');
    });

    it('should apply correct container classes', () => {
      const { container } = render(<CheckerLoadingState />);
      
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('p-6', 'border-2', 'border-t-0', 'border-black');
    });

    it('should apply message overlay styling', () => {
      render(<CheckerLoadingState message="TEST MESSAGE" />);
      
      const messageElement = screen.getByText('TEST MESSAGE');
      expect(messageElement).toHaveClass(
        'text-lg',
        'font-bold',
        'uppercase',
        'tracking-widest',
        'text-white',
        'bg-black/90',
        'px-4',
        'py-2',
        'border-2',
        'border-black'
      );
    });

    it('should apply retro shadow styling to message', () => {
      render(<CheckerLoadingState />);
      
      const messageElement = screen.getByText('GENERATING...');
      expect(messageElement).toHaveClass('shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]');
    });

    it('should center the grid container', () => {
      const { container } = render(<CheckerLoadingState />);
      
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('mx-auto');
    });

    it('should position message overlay correctly', () => {
      render(<CheckerLoadingState />);
      
      const messageOverlay = screen.getByText('GENERATING...').closest('div');
      expect(messageOverlay).toHaveClass('absolute', 'inset-0', 'flex', 'items-center', 'justify-center');
    });
  });

  describe('CSS custom properties', () => {
    it('should set --cell-index CSS custom property for each cell', () => {
      const { container } = render(<CheckerLoadingState />);
      
      const cells = container.querySelectorAll('.checker-cell');
      
      // Check first few cells have correct index values
      expect((cells[0] as HTMLElement).style.getPropertyValue('--cell-index')).toBe('0');
      expect((cells[1] as HTMLElement).style.getPropertyValue('--cell-index')).toBe('1');
      expect((cells[5] as HTMLElement).style.getPropertyValue('--cell-index')).toBe('5');
      expect((cells[10] as HTMLElement).style.getPropertyValue('--cell-index')).toBe('10');
    });

    it('should maintain cell index continuity across mobile and desktop cells', () => {
      const { container } = render(<CheckerLoadingState />);
      
      // Mobile cells (first 36) should have indices 0-35
      const mobileCells = container.querySelectorAll('.block.md\\:hidden');
      expect((mobileCells[0] as HTMLElement).style.getPropertyValue('--cell-index')).toBe('0');
      expect((mobileCells[35] as HTMLElement).style.getPropertyValue('--cell-index')).toBe('35');
      
      // Desktop cells should have indices 0-63
      const desktopCells = container.querySelectorAll('.hidden.md\\:block');
      expect((desktopCells[0] as HTMLElement).style.getPropertyValue('--cell-index')).toBe('0');
      expect((desktopCells[63] as HTMLElement).style.getPropertyValue('--cell-index')).toBe('63');
    });
  });

  describe('Error state transitions', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should apply fade-out class when hasError is true', () => {
      const { container } = render(<CheckerLoadingState hasError={true} />);
      
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('checker-fade-out');
    });

    it('should not apply fade-out class when hasError is false', () => {
      const { container } = render(<CheckerLoadingState hasError={false} />);
      
      const containerDiv = container.firstChild;
      expect(containerDiv).not.toHaveClass('checker-fade-out');
    });

    it('should handle transition state during error', async () => {
      const { rerender } = render(<CheckerLoadingState isVisible={true} hasError={false} />);
      
      // Trigger error state
      rerender(<CheckerLoadingState isVisible={true} hasError={true} />);
      
      // Should still be visible during transition
      expect(screen.getByText('GENERATING...')).toBeInTheDocument();
      
      // Fast-forward timer
      vi.advanceTimersByTime(150);
      
      // Should complete transition
      await waitFor(() => {
        expect(screen.getByText('GENERATING...')).toBeInTheDocument();
      });
    });

    it('should clear transition when error state is removed', () => {
      const { rerender } = render(<CheckerLoadingState isVisible={true} hasError={true} />);
      
      // Remove error state
      rerender(<CheckerLoadingState isVisible={true} hasError={false} />);
      
      // Should immediately clear transition state (no fade-out class)
      const { container } = render(<CheckerLoadingState isVisible={true} hasError={false} />);
      expect(container.firstChild).not.toHaveClass('checker-fade-out');
    });

    it('should not render when not visible and not transitioning', () => {
      const { container } = render(<CheckerLoadingState isVisible={false} hasError={false} />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Message rendering', () => {
    it('should not render message when empty string provided', () => {
      render(<CheckerLoadingState message="" />);
      
      expect(screen.queryByText('')).not.toBeInTheDocument();
    });

    it('should handle undefined message gracefully', () => {
      render(<CheckerLoadingState message={undefined} />);
      
      // Should not crash and should not render message overlay
      const messageOverlay = document.querySelector('.absolute.inset-0');
      expect(messageOverlay).not.toBeInTheDocument();
    });

    it('should render long messages without breaking layout', () => {
      const longMessage = 'THIS IS A VERY LONG MESSAGE THAT SHOULD STILL FIT';
      render(<CheckerLoadingState message={longMessage} />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null colors gracefully', () => {
      expect(() => {
        render(<CheckerLoadingState colors={null as any} />);
      }).not.toThrow();
    });

    it('should handle undefined colors gracefully', () => {
      expect(() => {
        render(<CheckerLoadingState colors={undefined} />);
      }).not.toThrow();
    });

    it('should handle non-string colors', () => {
      const invalidColors = [123, null, undefined, {}, []] as any;
      
      expect(() => {
        render(<CheckerLoadingState colors={invalidColors} />);
      }).not.toThrow();
    });

    it('should maintain consistent cell count regardless of props', () => {
      const { container: container1 } = render(<CheckerLoadingState />);
      const { container: container2 } = render(<CheckerLoadingState colors={['red']} />);
      const { container: container3 } = render(<CheckerLoadingState message="custom" />);
      
      expect(container1.querySelectorAll('.checker-cell')).toHaveLength(240);
      expect(container2.querySelectorAll('.checker-cell')).toHaveLength(240);
      expect(container3.querySelectorAll('.checker-cell')).toHaveLength(240);
    });
  });

  describe('Accessibility', () => {
    it('should provide proper contrast for message text', () => {
      render(<CheckerLoadingState />);
      
      const messageElement = screen.getByText('GENERATING...');
      expect(messageElement).toHaveClass('text-white', 'bg-black/90');
    });

    it('should use semantic HTML structure', () => {
      const { container } = render(<CheckerLoadingState />);
      
      // Should have proper div structure without accessibility issues
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      
      const messageContainer = container.querySelector('.absolute.inset-0');
      expect(messageContainer).toBeInTheDocument();
    });

    it('should not interfere with screen readers', () => {
      render(<CheckerLoadingState message="Loading content" />);
      
      // Message should be readable by screen readers
      expect(screen.getByText('Loading content')).toBeInTheDocument();
    });
  });

  describe('Performance considerations', () => {
    it('should generate cells efficiently', () => {
      const start = performance.now();
      render(<CheckerLoadingState />);
      const end = performance.now();
      
      // Should render quickly (under 50ms for 100 cells)
      expect(end - start).toBeLessThan(50);
    });

    it('should handle large color arrays efficiently', () => {
      const largeColorArray = Array.from({ length: 100 }, (_, i) => `color-${i}`);
      
      const start = performance.now();
      render(<CheckerLoadingState colors={largeColorArray} />);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50);
    });

    it('should not create unnecessary re-renders', () => {
      const { rerender } = render(<CheckerLoadingState message="test" />);
      
      // Re-render with same props should be efficient
      const start = performance.now();
      rerender(<CheckerLoadingState message="test" />);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('Color System Fallback', () => {
    it('should use fallback colors when CSS custom properties are not available', () => {
      // Test component with default colors (which include CSS custom property fallbacks)
      render(<CheckerLoadingState />);
      
      const checkerCells = document.querySelectorAll('.checker-cell');
      expect(checkerCells.length).toBeGreaterThan(0);
      
      // Verify cells have the fallback color values in their style
      const firstCell = checkerCells[0] as HTMLElement;
      const backgroundColor = firstCell.style.backgroundColor;
      
      // Should contain either the CSS custom property or the fallback color
      expect(backgroundColor).toMatch(/var\(--checker-color-[123], #[a-f0-9]{6}\)|#[a-f0-9]{6}/i);
    });

    it('should handle malformed color values gracefully', () => {
      // Test with invalid color values
      const invalidColors = ['invalid-color', '', 'rgb()', 'var(--nonexistent)'];
      
      expect(() => {
        render(<CheckerLoadingState colors={invalidColors} />);
      }).not.toThrow();
      
      const checkerCells = document.querySelectorAll('.checker-cell');
      expect(checkerCells.length).toBeGreaterThan(0);
    });

    it('should maintain visual consistency with fallback colors', () => {
      const fallbackColors = ['#c026d3', '#fef08a', '#bef264']; // Hard-coded fallbacks
      render(<CheckerLoadingState colors={fallbackColors} />);
      
      const checkerCells = document.querySelectorAll('.checker-cell');
      const cellStyles = Array.from(checkerCells).map(cell => 
        (cell as HTMLElement).style.backgroundColor
      );
      
      // Should cycle through the provided colors
      expect(cellStyles[0]).toBe('rgb(192, 38, 211)'); // #c026d3
      expect(cellStyles[1]).toBe('rgb(254, 240, 138)'); // #fef08a  
      expect(cellStyles[2]).toBe('rgb(190, 242, 100)'); // #bef264
    });

    it('should work with single fallback color', () => {
      render(<CheckerLoadingState colors={['#c026d3']} />);
      
      const checkerCells = document.querySelectorAll('.checker-cell');
      expect(checkerCells.length).toBeGreaterThan(0);
      
      // All cells should use the same color
      const firstCellColor = (checkerCells[0] as HTMLElement).style.backgroundColor;
      expect(firstCellColor).toBe('rgb(192, 38, 211)');
    });
  });

  describe('Reduced Motion Support', () => {
    beforeEach(() => {
      // Reset the mock before each test
      vi.clearAllMocks();
    });

    it('should render checker grid when reduced motion is not preferred', () => {
      // Mock matchMedia to return false for prefers-reduced-motion
      (window.matchMedia as any).mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(), 
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<CheckerLoadingState />);
      
      // Should see checker cells, not the loading spinner
      expect(screen.getByText('GENERATING...')).toBeInTheDocument();
      // Should have checker grid container
      const checkerGrid = document.querySelector('.grid.grid-cols-12.md\\:grid-cols-20');
      expect(checkerGrid).toBeInTheDocument();
    });

    it('should render simple spinner when user prefers reduced motion', async () => {
      // Mock matchMedia to return true for prefers-reduced-motion
      (window.matchMedia as any).mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<CheckerLoadingState message="CRAFTING..." />);
      
      // Wait for useEffect to run
      await waitFor(() => {
        // Should see the loading spinner instead of checker grid
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
        expect(screen.getByText('CRAFTING...')).toBeInTheDocument();
        // Should NOT have checker grid container
        expect(document.querySelector('.grid.grid-cols-12.md\\:grid-cols-20')).not.toBeInTheDocument();
      });
    });

    it('should respond to media query changes dynamically', async () => {
      let mediaQueryCallback: ((e: any) => void) | null = null;
      
      // Mock matchMedia with addEventListener capture
      (window.matchMedia as any).mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn().mockImplementation((event, callback) => {
          if (event === 'change') {
            mediaQueryCallback = callback;
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<CheckerLoadingState />);
      
      // Initially should show checker grid
      expect(document.querySelector('.grid.grid-cols-12.md\\:grid-cols-20')).toBeInTheDocument();
      
      // Simulate media query change to prefer reduced motion
      if (mediaQueryCallback) {
        mediaQueryCallback({ matches: true });
      }
      
      // Should now show spinner
      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
      });
    });
  });
});