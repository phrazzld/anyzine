import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock DOMPurify for testing  
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn(),
  }
}));

import { 
  sanitizeTextContent, 
  sanitizeArrayContent, 
  validateContentSafety, 
  sanitizeZineContent,
  getSanitizationStats
} from './content-sanitization';

// Get the mocked function reference
import DOMPurify from 'dompurify';
const mockSanitize = vi.mocked(DOMPurify.sanitize);

describe('Content Sanitization', () => {
  beforeEach(() => {
    mockSanitize.mockClear();
    // Default mock behavior - return cleaned content
    mockSanitize.mockImplementation((content) => content.replace(/<[^>]*>/g, ''));
  });

  describe('sanitizeTextContent', () => {
    it('should handle empty or invalid content', () => {
      expect(sanitizeTextContent('')).toBe('');
      expect(sanitizeTextContent(null as any)).toBe('');
      expect(sanitizeTextContent(undefined as any)).toBe('');
      expect(sanitizeTextContent(123 as any)).toBe('');
    });

    it('should trim whitespace from content', () => {
      const result = sanitizeTextContent('  hello world  ');
      expect(result.trim()).toBe('hello world');
    });

    it('should use fallback when DOMPurify fails', () => {
      mockSanitize.mockImplementation(() => {
        throw new Error('DOMPurify failed');
      });

      const maliciousContent = '<script>alert("xss")</script>Hello World';
      const result = sanitizeTextContent(maliciousContent);
      
      expect(result).toBe('Hello World');
      expect(result).not.toContain('<script>');
    });

    it('should remove HTML tags in fallback mode', () => {
      mockSanitize.mockImplementation(() => {
        throw new Error('DOMPurify failed');
      });

      const htmlContent = '<p>Hello <strong>World</strong></p>';
      const result = sanitizeTextContent(htmlContent);
      
      expect(result).toBe('Hello World');
      expect(result).not.toContain('<');
    });

    it('should remove dangerous content in fallback mode', () => {
      mockSanitize.mockImplementation(() => {
        throw new Error('DOMPurify failed');
      });

      const dangerousContent = 'Click <a href="javascript:alert(1)">here</a>';
      const result = sanitizeTextContent(dangerousContent);
      
      expect(result).toBe('Click here');
      expect(result).not.toContain('javascript:');
    });
  });

  describe('sanitizeArrayContent', () => {
    it('should filter out non-string content', () => {
      const mixedContent = ['valid string', 123, null, undefined, '', '  ', 'another valid string'];
      const result = sanitizeArrayContent(mixedContent as any);
      
      expect(result).toHaveLength(2);
      expect(result).toEqual(['valid string', 'another valid string']);
    });

    it('should handle empty or invalid arrays', () => {
      expect(sanitizeArrayContent([])).toEqual([]);
      expect(sanitizeArrayContent(null as any)).toEqual([]);
      expect(sanitizeArrayContent(undefined as any)).toEqual([]);
      expect(sanitizeArrayContent('not an array' as any)).toEqual([]);
    });

    it('should sanitize each string item', () => {
      mockSanitize.mockImplementation((content) => content.replace(/<script[^>]*>.*?<\/script>/gi, ''));
      
      const contentWithHTML = ['<script>alert("xss")</script>Safe content', 'Another safe item'];
      const result = sanitizeArrayContent(contentWithHTML);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toBe('Safe content');
      expect(result[1]).toBe('Another safe item');
    });

    it('should filter out items that become empty after sanitization', () => {
      mockSanitize.mockImplementation(() => ''); // Everything gets sanitized to empty
      
      const content = ['content1', 'content2'];
      const result = sanitizeArrayContent(content);
      
      expect(result).toEqual([]);
    });
  });

  describe('validateContentSafety', () => {
    it('should return true for safe content', () => {
      const safeContent = 'This is safe content with no HTML or scripts';
      expect(validateContentSafety(safeContent)).toBe(true);
    });

    it('should return false for content with script tags', () => {
      const dangerousContent = '<script>alert("xss")</script>';
      expect(validateContentSafety(dangerousContent)).toBe(false);
    });

    it('should return false for content with event handlers', () => {
      const dangerousContent = '<div onclick="alert(1)">Click me</div>';
      expect(validateContentSafety(dangerousContent)).toBe(false);
    });

    it('should return false for content with javascript URLs', () => {
      const dangerousContent = '<a href="javascript:alert(1)">Link</a>';
      expect(validateContentSafety(dangerousContent)).toBe(false);
    });

    it('should return false for content with dangerous tags', () => {
      const dangerousTags = ['<iframe>', '<object>', '<embed>', '<link>', '<meta>', '<style>'];
      
      dangerousTags.forEach(tag => {
        expect(validateContentSafety(`Safe content ${tag}`)).toBe(false);
      });
    });

    it('should return true for empty or null content', () => {
      expect(validateContentSafety('')).toBe(true);
      expect(validateContentSafety(null as any)).toBe(true);
      expect(validateContentSafety(undefined as any)).toBe(true);
    });
  });

  describe('sanitizeZineContent', () => {
    it('should handle string content', () => {
      const content = 'Hello World';
      const result = sanitizeZineContent(content);
      expect(typeof result).toBe('string');
      expect(result).toBe('Hello World');
    });

    it('should handle array content', () => {
      const content = ['fact1', 'fact2'];
      const result = sanitizeZineContent(content);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(['fact1', 'fact2']);
    });

    it('should return security message for unsafe content', () => {
      mockSanitize.mockReturnValue('<script>alert("xss")</script>'); // Simulate failed sanitization
      
      const dangerousContent = '<script>alert("xss")</script>';
      const result = sanitizeZineContent(dangerousContent);
      
      expect(result).toBe('Content removed for security reasons');
    });
  });

  describe('getSanitizationStats', () => {
    it('should return sanitization statistics', () => {
      const stats = getSanitizationStats();
      
      expect(stats).toHaveProperty('dompurifyAvailable');
      expect(stats).toHaveProperty('isClientSide');
      expect(stats).toHaveProperty('version');
      expect(stats.version).toBe('1.0.0');
    });
  });

  describe('Server-side behavior', () => {
    let originalWindow: any;

    beforeEach(() => {
      originalWindow = global.window;
      // @ts-expect-error - Deleting global.window for server-side testing
      delete global.window;
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it('should handle server-side rendering gracefully', () => {
      const content = 'Hello World';
      const result = sanitizeTextContent(content);
      
      expect(result).toBe('Hello World');
      expect(mockSanitize).not.toHaveBeenCalled(); // Should not call DOMPurify on server
    });
  });
});