/**
 * @fileoverview Zine content display component with neobrutalist styling and comprehensive security sanitization
 * Renders AI-generated zine content in a structured, responsive 2-column layout with color-coded sections
 */

'use client'

import { sanitizeZineContent } from '@/app/utils/content-sanitization';

/**
 * Base interface for all zine sections with common type property
 * @interface
 */
interface BaseZineSection {
  type: string;
}

/**
 * Interface for sections containing string content (banner, subheading, intro, main article, opinion, conclusion)
 * @interface
 * @extends BaseZineSection
 */
interface StringContentSection extends BaseZineSection {
  type: 'banner' | 'subheading' | 'intro' | 'mainArticle' | 'opinion' | 'conclusion';
  content: string;
}

/**
 * Interface for sections containing array content (fun facts list)
 * @interface
 * @extends BaseZineSection
 */
interface ArrayContentSection extends BaseZineSection {
  type: 'funFacts';
  content: string[];
}

/**
 * Discriminated union type for type-safe zine section handling
 * Replaces previous `any` usage with strict typing for enhanced type safety
 * @type {StringContentSection | ArrayContentSection}
 */
export type TZineSection = StringContentSection | ArrayContentSection;

/**
 * Display component for rendering AI-generated zine content with neobrutalist styling
 * 
 * @description Renders structured zine content with comprehensive features:
 * - Responsive 2-column layout (main article + sidebar sections)
 * - Color-coded sections for visual hierarchy (black header, colored backgrounds)
 * - Content sanitization for XSS protection from AI-generated content
 * - Type-safe section handling with discriminated unions
 * - Neobrutalist design with thick borders and bold typography
 * - Mobile-responsive design that stacks on smaller screens
 * 
 * @param {object} props - Component props
 * @param {TZineSection[]} props.sections - Array of zine sections with type and content
 * @returns {JSX.Element} Rendered zine content in structured layout
 * 
 * @example
 * ```tsx
 * const zineData = {
 *   sections: [
 *     { type: 'banner', content: 'COFFEE CULTURE' },
 *     { type: 'subheading', content: 'The daily ritual that powers the world' },
 *     { type: 'funFacts', content: ['Coffee is the 2nd most traded commodity', '2.25 billion cups consumed daily'] }
 *   ]
 * };
 * 
 * <ZineDisplay sections={zineData.sections} />
 * ```
 * 
 * @architecture
 * Layout Structure:
 * - Header: Full-width banner (black background) and subheading with intro
 * - Main Content: 2-column grid (desktop) / stacked (mobile)
 *   - Left Column (2/3): Main article content
 *   - Right Column (1/3): Opinion (fuchsia), Fun Facts (yellow), Conclusion (lime)
 * 
 * @security
 * - All content sanitized through DOMPurify integration before rendering
 * - HTML injection prevention with content safety validation
 * - Type guards prevent rendering of malformed section data
 * - XSS protection specifically for AI-generated content
 * 
 * @accessibility
 * - Semantic HTML structure with proper heading hierarchy
 * - Color-coded sections maintain sufficient contrast ratios
 * - Responsive design supports mobile screen readers
 * - List semantics preserved for fun facts section
 * 
 * @performance
 * - Efficient section finding with Array.find()
 * - Conditional rendering prevents unnecessary DOM nodes
 * - CSS Grid for efficient responsive layout
 * - Minimal re-renders through stable component structure
 */
export function ZineDisplay({ sections }: { sections: TZineSection[] }) {
  const banner = sections.find((sec) => sec.type === 'banner');
  const subheading = sections.find((sec) => sec.type === 'subheading');
  const intro = sections.find((sec) => sec.type === 'intro');
  const mainArticle = sections.find((sec) => sec.type === 'mainArticle');
  const opinion = sections.find((sec) => sec.type === 'opinion');
  const funFacts = sections.find((sec) => sec.type === 'funFacts');
  const conclusion = sections.find((sec) => sec.type === 'conclusion');

  return (
    <div className="p-0 space-y-0">
      {/* banner */}
      {banner && banner.type !== 'funFacts' && (
        <div className="p-6 border-2 border-black bg-black text-white text-center">
          <h1 className="text-4xl font-bold uppercase">{sanitizeZineContent(banner.content)}</h1>
        </div>
      )}

      {/* subheading */}
      {subheading && subheading.type !== 'funFacts' && (
        <div className="p-6 border-2 border-black">
          <h2 className="text-xl italic mb-4">{sanitizeZineContent(subheading.content)}</h2>
          {intro && intro.type !== 'funFacts' && (
            <>
              {String(sanitizeZineContent(intro.content)).split('\n').map((p: string, i: number) => (
                <p key={i}>{sanitizeZineContent(p)}</p>
              ))}
            </>
          )}
        </div>
      )}

      {/* intro */}

      {/* 2-col layout: main article (2/3), then stack opinion/funFacts/conclusion in (1/3) */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* left col = main article */}
        {mainArticle && mainArticle.type !== 'funFacts' && (
          <div className="p-6 border-2 border-t-0 border-r-0 border-black md:col-span-2">
            <h3 className="uppercase font-bold mb-2">main article</h3>
            {String(sanitizeZineContent(mainArticle.content)).split('\n').map((p: string, i: number) => (
              <p key={i} className="mb-4">{sanitizeZineContent(p)}</p>
            ))}
          </div>
        )}

        {/* right col: stack opinion, funFacts, conclusion */}
        <div className="flex flex-col">
          {opinion && opinion.type !== 'funFacts' && (
            <section className="p-6 border-2 border-t-0 border-black bg-fuchsia-400">
              <h3 className="uppercase font-bold mb-2">opinion</h3>
              <p>{sanitizeZineContent(opinion.content)}</p>
            </section>
          )}
          {funFacts && Array.isArray(funFacts.content) && (
            <section className="p-6 border-2 border-t-0 border-black bg-yellow-200">
              <h3 className="uppercase font-bold mb-2">fun facts</h3>
              <ul className="list-disc pl-8">
                {(sanitizeZineContent(funFacts.content) as string[]).map((fact: string, i: number) => (
                  <li key={i} className="mb-2">{fact}</li>
                ))}
              </ul>
            </section>
          )}
          {conclusion && conclusion.type !== 'funFacts' && (
            <section className="p-6 border-2 border-t-0 border-black bg-lime-300">
              <h3 className="uppercase font-bold mb-2">conclusion</h3>
              {String(sanitizeZineContent(conclusion.content)).split('\n').map((p: string, i: number) => (
                <p key={i} className="mb-4">{sanitizeZineContent(p)}</p>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
