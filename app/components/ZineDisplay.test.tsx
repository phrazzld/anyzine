import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZineDisplay, TZineSection } from './ZineDisplay';

describe('ZineDisplay', () => {
  const mockSections: TZineSection[] = [
    { type: 'banner', content: 'TEST ZINE BANNER' },
    { type: 'subheading', content: 'This is a test subheading' },
    { type: 'intro', content: 'This is the introduction paragraph.\nThis is a second paragraph in the intro.' },
    { type: 'mainArticle', content: 'This is the main article content.\nSecond paragraph of main article.\nThird paragraph.' },
    { type: 'opinion', content: 'This is my strong opinion about the topic and why it matters.' },
    { type: 'funFacts', content: ['Fact number one is interesting', 'Fact number two is also cool', 'Third fact is amazing'] },
    { type: 'conclusion', content: 'This is the conclusion paragraph.\nFinal thoughts go here.' },
  ];

  describe('Basic rendering', () => {
    it('should render all sections when provided', () => {
      render(<ZineDisplay sections={mockSections} />);

      expect(screen.getByText('TEST ZINE BANNER')).toBeInTheDocument();
      expect(screen.getByText('This is a test subheading')).toBeInTheDocument();
      expect(screen.getByText('This is the introduction paragraph.')).toBeInTheDocument();
      expect(screen.getByText('This is the main article content.')).toBeInTheDocument();
      expect(screen.getByText('This is my strong opinion about the topic and why it matters.')).toBeInTheDocument();
      expect(screen.getByText('Fact number one is interesting')).toBeInTheDocument();
      expect(screen.getByText('This is the conclusion paragraph.')).toBeInTheDocument();
    });

    it('should render empty zine when no sections provided', () => {
      const { container } = render(<ZineDisplay sections={[]} />);
      
      expect(container.firstChild).toHaveClass('p-0', 'space-y-0');
      expect(container.querySelector('h1')).not.toBeInTheDocument();
      expect(container.querySelector('h2')).not.toBeInTheDocument();
      expect(container.querySelector('h3')).not.toBeInTheDocument();
    });

    it('should handle partial sections gracefully', () => {
      const partialSections: TZineSection[] = [
        { type: 'banner', content: 'PARTIAL BANNER' },
        { type: 'conclusion', content: 'Just a conclusion' }
      ];

      render(<ZineDisplay sections={partialSections} />);

      expect(screen.getByText('PARTIAL BANNER')).toBeInTheDocument();
      expect(screen.getByText('Just a conclusion')).toBeInTheDocument();
      expect(screen.queryByText('main article')).not.toBeInTheDocument();
      expect(screen.queryByText('opinion')).not.toBeInTheDocument();
    });
  });

  describe('Banner section', () => {
    it('should render banner with correct styling and structure', () => {
      const bannerSection: TZineSection[] = [
        { type: 'banner', content: 'BOLD BANNER TEXT' }
      ];

      render(<ZineDisplay sections={bannerSection} />);

      const banner = screen.getByRole('heading', { level: 1 });
      expect(banner).toHaveTextContent('BOLD BANNER TEXT');
      expect(banner).toHaveClass('text-4xl', 'font-bold', 'uppercase');
      expect(banner.closest('div')).toHaveClass('bg-black', 'text-white', 'text-center');
    });

    it('should not render banner section when not provided', () => {
      const noBarnerSections: TZineSection[] = [
        { type: 'intro', content: 'No banner here' }
      ];

      render(<ZineDisplay sections={noBarnerSections} />);

      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });
  });

  describe('Subheading and intro sections', () => {
    it('should render subheading with correct styling', () => {
      const sections: TZineSection[] = [
        { type: 'subheading', content: 'Test Subheading' }
      ];

      render(<ZineDisplay sections={sections} />);

      const subheading = screen.getByRole('heading', { level: 2 });
      expect(subheading).toHaveTextContent('Test Subheading');
      expect(subheading).toHaveClass('text-xl', 'italic', 'mb-4');
    });

    it('should render intro content within subheading section', () => {
      const sections: TZineSection[] = [
        { type: 'subheading', content: 'With Intro' },
        { type: 'intro', content: 'Intro paragraph one.\nIntro paragraph two.' }
      ];

      render(<ZineDisplay sections={sections} />);

      expect(screen.getByText('Intro paragraph one.')).toBeInTheDocument();
      expect(screen.getByText('Intro paragraph two.')).toBeInTheDocument();
    });

    it('should handle intro without subheading', () => {
      const sections: TZineSection[] = [
        { type: 'intro', content: 'Standalone intro.' }
      ];

      render(<ZineDisplay sections={sections} />);

      // Intro should not render without subheading section
      expect(screen.queryByText('Standalone intro.')).not.toBeInTheDocument();
    });

    it('should split intro content by newlines into separate paragraphs', () => {
      const sections: TZineSection[] = [
        { type: 'subheading', content: 'Multi-para Intro' },
        { type: 'intro', content: 'First paragraph.\nSecond paragraph.\nThird paragraph.' }
      ];

      const { container } = render(<ZineDisplay sections={sections} />);
      const paragraphs = container.querySelectorAll('p');
      
      expect(paragraphs).toHaveLength(3);
      expect(paragraphs[0]).toHaveTextContent('First paragraph.');
      expect(paragraphs[1]).toHaveTextContent('Second paragraph.');
      expect(paragraphs[2]).toHaveTextContent('Third paragraph.');
    });
  });

  describe('Main article section', () => {
    it('should render main article with correct structure and styling', () => {
      const sections: TZineSection[] = [
        { type: 'mainArticle', content: 'Article paragraph one.\nArticle paragraph two.' }
      ];

      render(<ZineDisplay sections={sections} />);

      const heading = screen.getByRole('heading', { level: 3, name: 'main article' });
      expect(heading).toHaveClass('uppercase', 'font-bold', 'mb-2');

      expect(screen.getByText('Article paragraph one.')).toBeInTheDocument();
      expect(screen.getByText('Article paragraph two.')).toBeInTheDocument();
    });

    it('should split main article content by newlines into paragraphs', () => {
      const sections: TZineSection[] = [
        { type: 'mainArticle', content: 'Para 1.\nPara 2.\nPara 3.\nPara 4.' }
      ];

      const { container } = render(<ZineDisplay sections={sections} />);
      
      // Look for paragraphs within the main article section
      const mainSection = container.querySelector('.md\\:col-span-2');
      const paragraphs = mainSection?.querySelectorAll('p');
      
      expect(paragraphs).toHaveLength(4);
      expect(paragraphs![0]).toHaveTextContent('Para 1.');
      expect(paragraphs![3]).toHaveTextContent('Para 4.');
    });

    it('should use correct grid layout classes', () => {
      const sections: TZineSection[] = [
        { type: 'mainArticle', content: 'Main content' }
      ];

      const { container } = render(<ZineDisplay sections={sections} />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-3');

      const mainArticleSection = container.querySelector('.md\\:col-span-2');
      expect(mainArticleSection).toBeInTheDocument();
    });
  });

  describe('Opinion section', () => {
    it('should render opinion section with correct styling', () => {
      const sections: TZineSection[] = [
        { type: 'opinion', content: 'This is my strong opinion on the matter.' }
      ];

      render(<ZineDisplay sections={sections} />);

      const heading = screen.getByRole('heading', { level: 3, name: 'opinion' });
      expect(heading).toHaveClass('uppercase', 'font-bold', 'mb-2');

      const opinionSection = heading.closest('section');
      expect(opinionSection).toHaveStyle({ backgroundColor: '#ff6ee8' });
      expect(screen.getByText('This is my strong opinion on the matter.')).toBeInTheDocument();
    });
  });

  describe('Fun facts section', () => {
    it('should render fun facts as a bulleted list', () => {
      const sections: TZineSection[] = [
        { type: 'funFacts', content: ['First amazing fact', 'Second cool fact', 'Third interesting fact'] }
      ];

      render(<ZineDisplay sections={sections} />);

      const heading = screen.getByRole('heading', { level: 3, name: 'fun facts' });
      expect(heading).toBeInTheDocument();

      const list = screen.getByRole('list');
      expect(list).toHaveClass('list-disc', 'pl-8');

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
      expect(listItems[0]).toHaveTextContent('First amazing fact');
      expect(listItems[1]).toHaveTextContent('Second cool fact');
      expect(listItems[2]).toHaveTextContent('Third interesting fact');
    });

    it('should have correct background color', () => {
      const sections: TZineSection[] = [
        { type: 'funFacts', content: ['One fact'] }
      ];

      render(<ZineDisplay sections={sections} />);

      const heading = screen.getByRole('heading', { level: 3, name: 'fun facts' });
      const factsSection = heading.closest('section');
      expect(factsSection).toHaveClass('bg-yellow-200');
    });

    it('should not render if content is not an array', () => {
      const sections: TZineSection[] = [
        { type: 'funFacts', content: 'This is not an array' }
      ];

      render(<ZineDisplay sections={sections} />);

      expect(screen.queryByRole('heading', { name: 'fun facts' })).not.toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('should handle empty facts array', () => {
      const sections: TZineSection[] = [
        { type: 'funFacts', content: [] }
      ];

      render(<ZineDisplay sections={sections} />);

      const heading = screen.getByRole('heading', { level: 3, name: 'fun facts' });
      expect(heading).toBeInTheDocument();

      screen.getByRole('list');
      const listItems = screen.queryAllByRole('listitem');
      expect(listItems).toHaveLength(0);
    });
  });

  describe('Conclusion section', () => {
    it('should render conclusion with correct styling and structure', () => {
      const sections: TZineSection[] = [
        { type: 'conclusion', content: 'Final thoughts paragraph.\nClosing remarks.' }
      ];

      render(<ZineDisplay sections={sections} />);

      const heading = screen.getByRole('heading', { level: 3, name: 'conclusion' });
      expect(heading).toHaveClass('uppercase', 'font-bold', 'mb-2');

      const conclusionSection = heading.closest('section');
      expect(conclusionSection).toHaveStyle({ backgroundColor: '#a8ff9b' });

      expect(screen.getByText('Final thoughts paragraph.')).toBeInTheDocument();
      expect(screen.getByText('Closing remarks.')).toBeInTheDocument();
    });

    it('should split conclusion content into paragraphs', () => {
      const sections: TZineSection[] = [
        { type: 'conclusion', content: 'First conclusion para.\nSecond conclusion para.\nThird para.' }
      ];

      render(<ZineDisplay sections={sections} />);

      // Find conclusion section by looking for heading then closest section
      const conclusionHeading = screen.getByRole('heading', { level: 3, name: 'conclusion' });
      const conclusionSection = conclusionHeading.closest('section');
      const paragraphs = conclusionSection?.querySelectorAll('p');
      
      expect(paragraphs).toHaveLength(3);
      expect(paragraphs![0]).toHaveTextContent('First conclusion para.');
      expect(paragraphs![2]).toHaveTextContent('Third para.');
    });
  });

  describe('Layout and structure', () => {
    it('should use correct container classes', () => {
      const sections: TZineSection[] = [
        { type: 'banner', content: 'Test' }
      ];

      const { container } = render(<ZineDisplay sections={sections} />);

      expect(container.firstChild).toHaveClass('p-0', 'space-y-0');
    });

    it('should render sections in correct order', () => {
      const { container } = render(<ZineDisplay sections={mockSections} />);

      const headings = container.querySelectorAll('h1, h2, h3');
      
      // Banner (h1) should be first
      expect(headings[0]).toHaveTextContent('TEST ZINE BANNER');
      expect(headings[0].tagName).toBe('H1');
      
      // Subheading (h2) should be second
      expect(headings[1]).toHaveTextContent('This is a test subheading');
      expect(headings[1].tagName).toBe('H2');
      
      // Main article (h3) should be third
      expect(headings[2]).toHaveTextContent('main article');
      expect(headings[2].tagName).toBe('H3');
    });

    it('should maintain proper semantic heading hierarchy', () => {
      render(<ZineDisplay sections={mockSections} />);

      const h1 = screen.queryByRole('heading', { level: 1 });
      const h2 = screen.queryByRole('heading', { level: 2 });
      const h3s = screen.queryAllByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3s.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle sections with empty content', () => {
      const sections: TZineSection[] = [
        { type: 'banner', content: '' },
        { type: 'mainArticle', content: '' }
      ];

      render(<ZineDisplay sections={sections} />);

      const banner = screen.getByRole('heading', { level: 1 });
      expect(banner).toHaveTextContent('');

      const mainHeading = screen.getByRole('heading', { level: 3, name: 'main article' });
      expect(mainHeading).toBeInTheDocument();
    });

    it('should handle unknown section types gracefully', () => {
      const sections: TZineSection[] = [
        { type: 'banner', content: 'Valid banner' },
        { type: 'unknownType', content: 'Unknown content' },
        { type: 'conclusion', content: 'Valid conclusion' }
      ];

      render(<ZineDisplay sections={sections} />);

      expect(screen.getByText('Valid banner')).toBeInTheDocument();
      expect(screen.getByText('Valid conclusion')).toBeInTheDocument();
      expect(screen.queryByText('Unknown content')).not.toBeInTheDocument();
    });

    it('should handle null and undefined content', () => {
      const sections: TZineSection[] = [
        { type: 'banner', content: null },
        { type: 'opinion', content: undefined }
      ];

      // These should render without content since they don't use .split()
      expect(() => {
        render(<ZineDisplay sections={sections} />);
      }).not.toThrow();
      
      // Banner with null content should still render the heading structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should handle mixed content types in funFacts', () => {
      const sections: TZineSection[] = [
        { type: 'funFacts', content: ['String fact', 123, null, undefined, 'Another string'] }
      ];

      render(<ZineDisplay sections={sections} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(5); // Should render all items, even non-strings
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure for screen readers', () => {
      render(<ZineDisplay sections={mockSections} />);

      const headings = screen.getAllByRole('heading');
      
      // Should have h1, h2, and multiple h3s
      expect(headings.some(h => h.tagName === 'H1')).toBe(true);
      expect(headings.some(h => h.tagName === 'H2')).toBe(true);
      expect(headings.some(h => h.tagName === 'H3')).toBe(true);
    });

    it('should have proper list semantics for fun facts', () => {
      const sections: TZineSection[] = [
        { type: 'funFacts', content: ['Accessible fact one', 'Accessible fact two'] }
      ];

      render(<ZineDisplay sections={sections} />);

      const list = screen.getByRole('list');
      const listItems = screen.getAllByRole('listitem');
      
      expect(list).toBeInTheDocument();
      expect(listItems).toHaveLength(2);
    });

    it('should have descriptive section headings', () => {
      render(<ZineDisplay sections={mockSections} />);

      expect(screen.getByRole('heading', { name: 'main article' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'opinion' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'fun facts' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'conclusion' })).toBeInTheDocument();
    });
  });
});