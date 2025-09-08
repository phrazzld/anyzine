import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import React from 'react';

// Mock Next.js router
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock OpenAI (to avoid API calls in tests)
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

// Mock Clerk authentication
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({
    user: null, // Default to unauthenticated
    isLoaded: true,
    isSignedIn: false,
  })),
  useAuth: vi.fn(() => ({
    isLoaded: true,
    isSignedIn: false,
    userId: null,
    sessionId: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
  })),
  useClerk: vi.fn(() => ({
    session: null,
    user: null,
  })),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignInButton: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'sign-in-button' }, children),
  SignOutButton: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'sign-out-button' }, children),
  UserButton: () => React.createElement('div', { 'data-testid': 'user-button' }),
  SignedIn: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'signed-in' }, children),
  SignedOut: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'signed-out' }, children),
}));

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => null), // Default to no data
  useMutation: vi.fn(() => vi.fn()),
  useAction: vi.fn(() => vi.fn()),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
  ConvexReactClient: vi.fn(),
}));

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for testing
beforeAll(() => {
  process.env.OPENAI_API_KEY = 'test-api-key';
  
  // Mock window.matchMedia for components that check reduced motion preferences
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false, // Default to no reduced motion
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterAll(() => {
  // Clean up any global test state
});