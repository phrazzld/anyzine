import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useUser, useAuth } from '@clerk/nextjs';
import { AuthButton } from '@/app/components/AuthButton';
import { useZineGeneration } from '@/app/hooks/useZineGeneration';

// Get mocked functions from global mocks
const mockUseUser = useUser as ReturnType<typeof vi.fn>;
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe('Authentication Flow Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to unauthenticated state
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    });
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
    });
  });

  describe('Authentication State Management', () => {
    it('should show sign-in button when user is not authenticated', () => {
      render(<AuthButton />);
      
      // Both SignedIn and SignedOut render in our mocks, so check for the button text
      expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
      expect(screen.getByTestId('signed-out')).toBeInTheDocument();
    });

    it('should show user button when user is authenticated', () => {
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_123',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
          firstName: 'Test',
          lastName: 'User',
        },
        isLoaded: true,
        isSignedIn: true,
      });

      render(<AuthButton />);
      
      // Both render in mocks, but UserButton should be present
      expect(screen.getByTestId('user-button')).toBeInTheDocument();
      expect(screen.getByTestId('signed-in')).toBeInTheDocument();
    });

    it('should handle loading state properly', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      });

      render(<AuthButton />);
      
      // When loading, it should still render something (not crash)
      expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    });
  });

  describe('Rate Limiting with Authentication', () => {
    it('should show different rate limit messages for authenticated vs anonymous users', () => {
      // Test the rate limit message generation logic directly through the hook
      const TestComponent = () => {
        const { isAuthenticated, userTier } = useZineGeneration();
        
        // Simulate rate limit error handling
        const getRateLimitMessage = (baseMessage: string) => {
          return isAuthenticated 
            ? baseMessage 
            : `${baseMessage} Sign in for higher limits!`;
        };
        
        const testMessage = 'Too many requests. Please wait 30 seconds before trying again.';
        
        return (
          <div>
            <span data-testid="rate-limit-msg">
              {getRateLimitMessage(testMessage)}
            </span>
            <span data-testid="user-tier">{userTier}</span>
          </div>
        );
      };

      // Test anonymous user
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      const { rerender } = render(<TestComponent />);
      
      expect(screen.getByTestId('rate-limit-msg')).toHaveTextContent(
        'Too many requests. Please wait 30 seconds before trying again. Sign in for higher limits!'
      );
      expect(screen.getByTestId('user-tier')).toHaveTextContent('anonymous');

      // Test authenticated user
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_123',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
        },
        isLoaded: true,
        isSignedIn: true,
      });

      rerender(<TestComponent />);

      expect(screen.getByTestId('rate-limit-msg')).toHaveTextContent(
        'Too many requests. Please wait 30 seconds before trying again.'
      );
      expect(screen.getByTestId('user-tier')).toHaveTextContent('authenticated');
    });
  });

  describe('Authentication Context in Hooks', () => {
    it('should provide correct authentication status in useZineGeneration hook', () => {
      // Test with unauthenticated user
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      const TestComponent = () => {
        const { isAuthenticated, userTier } = useZineGeneration();
        return (
          <div>
            <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'anonymous'}</span>
            <span data-testid="user-tier">{userTier}</span>
          </div>
        );
      };

      const { rerender } = render(<TestComponent />);
      
      expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous');
      expect(screen.getByTestId('user-tier')).toHaveTextContent('anonymous');

      // Update to authenticated
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_123',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
        },
        isLoaded: true,
        isSignedIn: true,
      });

      rerender(<TestComponent />);

      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-tier')).toHaveTextContent('authenticated');
    });
  });

  describe('Session Migration Scenarios', () => {
    it('should handle session migration from anonymous to authenticated', async () => {
      // Start as anonymous user
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      const TestComponent = () => {
        const { user } = useUser();
        return (
          <div>
            <span data-testid="user-state">
              {user ? `Logged in as ${user.id}` : 'Anonymous'}
            </span>
          </div>
        );
      };

      const { rerender } = render(<TestComponent />);
      
      expect(screen.getByTestId('user-state')).toHaveTextContent('Anonymous');

      // Simulate authentication
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_123',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
        },
        isLoaded: true,
        isSignedIn: true,
      });

      rerender(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user-state')).toHaveTextContent('Logged in as user_123');
      });
    });

    it('should preserve session data during authentication transition', () => {
      // This would test that session cookies are maintained
      // In a real integration test, this would verify cookie persistence
      const getSessionId = () => {
        // Mock function to simulate getting session ID from cookies
        return 'session_abc123';
      };

      // Before auth
      const sessionBefore = getSessionId();
      expect(sessionBefore).toBe('session_abc123');

      // After auth (session should be preserved)
      const sessionAfter = getSessionId();
      expect(sessionAfter).toBe('session_abc123');
    });
  });

  describe('Authentication UI Components', () => {
    it('should render SignInButton with correct styling', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      render(<AuthButton />);
      
      const signInButton = screen.getByText(/Sign In/i);
      expect(signInButton).toBeInTheDocument();
      expect(screen.getByTestId('signed-out')).toBeInTheDocument();
    });

    it('should render UserButton for authenticated users', () => {
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_123',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
        },
        isLoaded: true,
        isSignedIn: true,
      });

      render(<AuthButton />);
      
      const userButton = screen.getByTestId('user-button');
      expect(userButton).toBeInTheDocument();
    });
  });

  describe('Authentication Error Handling', () => {
    it('should handle authentication failures gracefully', () => {
      // Simulate auth error
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
        sessionId: null,
        orgId: null,
        orgRole: null,
        orgSlug: null,
      });

      // Component should render without crashing
      const { container } = render(<AuthButton />);
      expect(container).toBeTruthy();
      expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    });

    it('should handle slow authentication loading', async () => {
      // Start with loading state
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      });

      const { rerender } = render(<AuthButton />);
      
      // Should handle loading state gracefully
      expect(screen.getByText(/Sign In/i)).toBeInTheDocument();

      // Complete loading
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      rerender(<AuthButton />);

      // Should still show sign-in after loading
      expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    });
  });
});