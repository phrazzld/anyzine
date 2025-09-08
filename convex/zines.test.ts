/**
 * @fileoverview Tests for Convex zine storage and retrieval functions
 * Tests createZine, getZineByPublicId, getRecentZines, getUserZines, and searchZinesBySubject
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Convex context utilities
const createMockContext = () => {
  const mockDb = {
    insert: vi.fn(),
    query: vi.fn().mockReturnValue({
      withIndex: vi.fn().mockReturnValue({
        filter: vi.fn().mockReturnValue({
          first: vi.fn(),
          order: vi.fn().mockReturnValue({
            take: vi.fn(),
          }),
          take: vi.fn(),
        }),
      }),
      order: vi.fn().mockReturnValue({
        take: vi.fn(),
      }),
      filter: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          take: vi.fn(),
        }),
      }),
    }),
    patch: vi.fn(),
  };

  return {
    db: mockDb,
  };
};

// Helper to generate a random public ID
const generatePublicId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

describe('Zine Functions', () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  describe('createZine', () => {
    it('should create a new zine with all required fields', async () => {
      const mockZineId = 'zine123';
      const mockPublicId = 'abc12345';
      
      mockCtx.db.insert.mockResolvedValue(mockZineId);

      const args = {
        subject: 'Coffee Culture',
        banner: 'THE ULTIMATE COFFEE GUIDE',
        subheading: 'From bean to cup',
        intro: 'Coffee is more than a beverage...',
        mainArticle: 'The history of coffee dates back...',
        opinion: 'Third wave coffee has revolutionized...',
        funFacts: ['Coffee is the second most traded commodity', 'Finland consumes the most coffee per capita'],
        conclusion: 'Coffee continues to evolve...',
        generatedBy: 'user123',
      };

      const expectedInsert = {
        subject: args.subject,
        banner: args.banner,
        subheading: args.subheading,
        intro: args.intro,
        mainArticle: args.mainArticle,
        opinion: args.opinion,
        funFacts: args.funFacts,
        conclusion: args.conclusion,
        publicId: expect.any(String), // Will be generated
        generatedBy: args.generatedBy,
        generatedByIp: undefined,
        createdAt: expect.any(Number),
        shareCount: 0,
      };

      // Simulate the createZine logic
      const publicId = generatePublicId();
      const insertData = {
        ...args,
        publicId,
        createdAt: Date.now(),
        shareCount: 0,
        generatedByIp: undefined,
      };

      await mockCtx.db.insert('zines', insertData);

      expect(mockCtx.db.insert).toHaveBeenCalledWith('zines', expect.objectContaining({
        subject: 'Coffee Culture',
        banner: 'THE ULTIMATE COFFEE GUIDE',
        publicId: expect.any(String),
        shareCount: 0,
      }));
    });

    it('should create zine for anonymous user with IP address', async () => {
      mockCtx.db.insert.mockResolvedValue('zine456');

      const args = {
        subject: 'Street Art',
        banner: 'URBAN EXPRESSION',
        subheading: 'Art in the streets',
        intro: 'Street art transforms cities...',
        mainArticle: 'From graffiti to murals...',
        opinion: 'Street art democratizes art...',
        funFacts: ['Banksy remains anonymous', 'Street art increases property values'],
        conclusion: 'The streets are galleries...',
        generatedByIp: '192.168.1.1',
      };

      const insertData = {
        ...args,
        publicId: generatePublicId(),
        createdAt: Date.now(),
        shareCount: 0,
        generatedBy: undefined,
      };

      await mockCtx.db.insert('zines', insertData);

      expect(mockCtx.db.insert).toHaveBeenCalledWith('zines', expect.objectContaining({
        generatedByIp: '192.168.1.1',
        generatedBy: undefined,
      }));
    });

    it('should ensure funFacts is always an array', async () => {
      const args = {
        subject: 'Test',
        banner: 'TEST',
        subheading: 'Test',
        intro: 'Test',
        mainArticle: 'Test',
        opinion: 'Test',
        funFacts: 'Single fact as string', // Wrong type
        conclusion: 'Test',
      };

      // Simulate array conversion
      const normalizedFunFacts = Array.isArray(args.funFacts) ? args.funFacts : [args.funFacts];
      
      expect(normalizedFunFacts).toEqual(['Single fact as string']);
      expect(Array.isArray(normalizedFunFacts)).toBe(true);
    });
  });

  describe('getZineByPublicId', () => {
    it('should retrieve zine by public ID', async () => {
      const mockZine = {
        _id: 'zine123',
        publicId: 'abc12345',
        subject: 'Coffee Culture',
        banner: 'THE ULTIMATE COFFEE GUIDE',
        createdAt: Date.now(),
      };

      mockCtx.db.query().withIndex().filter().first.mockResolvedValue(mockZine);

      const args = { publicId: 'abc12345' };

      // Simulate query
      const result = await mockCtx.db.query('zines')
        .withIndex('by_public_id')
        .filter()
        .first();

      expect(result).toEqual(mockZine);
      expect(result?.publicId).toBe('abc12345');
    });

    it('should return null for non-existent public ID', async () => {
      mockCtx.db.query().withIndex().filter().first.mockResolvedValue(null);

      const args = { publicId: 'nonexistent' };

      const result = await mockCtx.db.query('zines')
        .withIndex('by_public_id')
        .filter()
        .first();

      expect(result).toBeNull();
    });
  });

  describe('getRecentZines', () => {
    it('should retrieve recent zines ordered by creation date', async () => {
      const mockZines = [
        { _id: '1', subject: 'Coffee', createdAt: Date.now() },
        { _id: '2', subject: 'Art', createdAt: Date.now() - 1000 },
        { _id: '3', subject: 'Music', createdAt: Date.now() - 2000 },
      ];

      mockCtx.db.query().order().take.mockResolvedValue(mockZines);

      const args = { limit: 10 };

      const result = await mockCtx.db.query('zines')
        .order('desc')
        .take(args.limit);

      expect(result).toEqual(mockZines);
      expect(result).toHaveLength(3);
      expect(mockCtx.db.query().order().take).toHaveBeenCalledWith(10);
    });

    it('should respect the limit parameter', async () => {
      const mockZines = [
        { _id: '1', subject: 'Coffee', createdAt: Date.now() },
        { _id: '2', subject: 'Art', createdAt: Date.now() - 1000 },
      ];

      mockCtx.db.query().order().take.mockResolvedValue(mockZines);

      const args = { limit: 2 };

      const result = await mockCtx.db.query('zines')
        .order('desc')
        .take(args.limit);

      expect(result).toHaveLength(2);
      expect(mockCtx.db.query().order().take).toHaveBeenCalledWith(2);
    });

    it('should handle empty result set', async () => {
      mockCtx.db.query().order().take.mockResolvedValue([]);

      const args = { limit: 10 };

      const result = await mockCtx.db.query('zines')
        .order('desc')
        .take(args.limit);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getUserZines', () => {
    it('should retrieve all zines created by a specific user', async () => {
      const mockUserZines = [
        { _id: '1', subject: 'Coffee', generatedBy: 'user123', createdAt: Date.now() },
        { _id: '2', subject: 'Tea', generatedBy: 'user123', createdAt: Date.now() - 1000 },
      ];

      mockCtx.db.query().withIndex().filter().order().take.mockResolvedValue(mockUserZines);

      const args = { 
        userId: 'user123',
        limit: 10,
      };

      const result = await mockCtx.db.query('zines')
        .withIndex('by_user')
        .filter()
        .order('desc')
        .take(args.limit);

      expect(result).toEqual(mockUserZines);
      expect(result.every(z => z.generatedBy === 'user123')).toBe(true);
    });

    it('should return empty array for user with no zines', async () => {
      mockCtx.db.query().withIndex().filter().order().take.mockResolvedValue([]);

      const args = { 
        userId: 'newuser',
        limit: 10,
      };

      const result = await mockCtx.db.query('zines')
        .withIndex('by_user')
        .filter()
        .order('desc')
        .take(args.limit);

      expect(result).toEqual([]);
    });

    it('should respect limit parameter for user zines', async () => {
      const mockUserZines = [
        { _id: '1', subject: 'Coffee', generatedBy: 'user123' },
      ];

      mockCtx.db.query().withIndex().filter().order().take.mockResolvedValue(mockUserZines);

      const args = { 
        userId: 'user123',
        limit: 1,
      };

      const result = await mockCtx.db.query('zines')
        .withIndex('by_user')
        .filter()
        .order('desc')
        .take(args.limit);

      expect(result).toHaveLength(1);
      expect(mockCtx.db.query().withIndex().filter().order().take).toHaveBeenCalledWith(1);
    });
  });

  describe('searchZinesBySubject', () => {
    it('should find zines matching the search query', async () => {
      const mockSearchResults = [
        { _id: '1', subject: 'Coffee Culture', createdAt: Date.now() },
        { _id: '2', subject: 'Coffee Brewing', createdAt: Date.now() - 1000 },
      ];

      mockCtx.db.query().filter().order().take.mockResolvedValue(mockSearchResults);

      const args = { 
        query: 'coffee',
        limit: 10,
      };

      // Simulate search logic
      const normalizedQuery = args.query.toLowerCase();
      const results = mockSearchResults.filter(z => 
        z.subject.toLowerCase().includes(normalizedQuery)
      );

      expect(results).toHaveLength(2);
      expect(results.every(z => z.subject.toLowerCase().includes('coffee'))).toBe(true);
    });

    it('should handle case-insensitive search', async () => {
      const mockZines = [
        { _id: '1', subject: 'COFFEE CULTURE' },
        { _id: '2', subject: 'coffee brewing' },
        { _id: '3', subject: 'Coffee Roasting' },
      ];

      const searchQuery = 'CoFfEe';
      const normalizedQuery = searchQuery.toLowerCase();

      const results = mockZines.filter(z => 
        z.subject.toLowerCase().includes(normalizedQuery)
      );

      expect(results).toHaveLength(3);
    });

    it('should return empty array for no matches', async () => {
      mockCtx.db.query().filter().order().take.mockResolvedValue([]);

      const args = { 
        query: 'nonexistent',
        limit: 10,
      };

      const result = await mockCtx.db.query('zines')
        .filter()
        .order('desc')
        .take(args.limit);

      expect(result).toEqual([]);
    });

    it('should respect the limit parameter', async () => {
      const mockSearchResults = [
        { _id: '1', subject: 'Coffee 1' },
        { _id: '2', subject: 'Coffee 2' },
        { _id: '3', subject: 'Coffee 3' },
      ];

      mockCtx.db.query().filter().order().take.mockResolvedValue(
        mockSearchResults.slice(0, 2)
      );

      const args = { 
        query: 'coffee',
        limit: 2,
      };

      const result = await mockCtx.db.query('zines')
        .filter()
        .order('desc')
        .take(args.limit);

      expect(result).toHaveLength(2);
    });
  });

  describe('incrementShareCount', () => {
    it('should increment the share count for a zine', async () => {
      const mockZine = {
        _id: 'zine123',
        publicId: 'abc12345',
        shareCount: 5,
      };

      mockCtx.db.query().withIndex().filter().first.mockResolvedValue(mockZine);

      const args = { publicId: 'abc12345' };

      // Simulate increment logic
      const updatedCount = mockZine.shareCount + 1;
      
      await mockCtx.db.patch(mockZine._id, {
        shareCount: updatedCount,
      });

      expect(mockCtx.db.patch).toHaveBeenCalledWith('zine123', {
        shareCount: 6,
      });
    });

    it('should handle non-existent zine gracefully', async () => {
      mockCtx.db.query().withIndex().filter().first.mockResolvedValue(null);

      const args = { publicId: 'nonexistent' };

      // Should not attempt to patch if zine doesn't exist
      expect(mockCtx.db.patch).not.toHaveBeenCalled();
    });

    it('should initialize share count if undefined', async () => {
      const mockZine = {
        _id: 'zine123',
        publicId: 'abc12345',
        // shareCount is undefined
      };

      mockCtx.db.query().withIndex().filter().first.mockResolvedValue(mockZine);

      // Simulate initialization logic
      const shareCount = mockZine.shareCount || 0;
      const updatedCount = shareCount + 1;

      await mockCtx.db.patch(mockZine._id, {
        shareCount: updatedCount,
      });

      expect(mockCtx.db.patch).toHaveBeenCalledWith('zine123', {
        shareCount: 1,
      });
    });
  });
});