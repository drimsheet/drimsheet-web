import {
  RequestPasswordResetSuccess,
  RequestPasswordResetSuccessContainer,
} from '@/auth/components/reset-password-request-success';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('RequestPasswordResetSuccess', () => {
  describe('Presentation Component', () => {
    it('renders text, countdown, and disabled retry button when countdown > 0', () => {
      render(
        <MemoryRouter>
          <RequestPasswordResetSuccess
            countdown={30}
            loading={false}
            onRetry={vi.fn()}
          />
        </MemoryRouter>
      );

      expect(screen.getByText(/Didn't receive it\?/i)).toBeInTheDocument();

      const retryButton = screen.getByRole('button', {
        name: /Retry in 30s/i,
      });

      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toBeDisabled();
    });

    it('enables retry button when countdown is 0', async () => {
      const user = userEvent.setup();
      const handleRetry = vi.fn();

      render(
        <MemoryRouter>
          <RequestPasswordResetSuccess
            countdown={0}
            loading={false}
            onRetry={handleRetry}
          />
        </MemoryRouter>
      );

      const retryButton = screen.getByRole('button', { name: /^Retry$/i });
      expect(retryButton).toBeEnabled();

      await user.click(retryButton);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('disables retry button when loading is true even if countdown is 0', () => {
      render(
        <MemoryRouter>
          <RequestPasswordResetSuccess
            countdown={0}
            loading={true}
            onRetry={vi.fn()}
          />
        </MemoryRouter>
      );

      const retryButton = screen.getByRole('button', { name: /^Retry$/i });
      expect(retryButton).toBeDisabled();
    });

    it('renders the back to sign in link pointing to /auth/signin', () => {
      render(
        <MemoryRouter>
          <RequestPasswordResetSuccess
            countdown={30}
            loading={false}
            onRetry={vi.fn()}
          />
        </MemoryRouter>
      );

      const signInLink = screen.getByRole('link', {
        name: /Back to sign in/i,
      });

      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/auth/signin');
    });
  });

  describe('Container Component', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      act(() => {
        vi.runOnlyPendingTimers();
      });
      vi.useRealTimers();
    });

    it('counts down from 30 to 0 over time', () => {
      render(
        <MemoryRouter>
          <RequestPasswordResetSuccessContainer
            loading={false}
            onRetry={vi.fn()}
          />
        </MemoryRouter>
      );

      expect(
        screen.getByRole('button', { name: /Retry in 30s/i })
      ).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(
        screen.getByRole('button', { name: /Retry in 20s/i })
      ).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(20000);
      });

      const retryButton = screen.getByRole('button', { name: /^Retry$/i });
      expect(retryButton).toBeEnabled();
    });

    it('resets the countdown to 30 when retry is triggered', () => {
      const handleRetry = vi.fn();

      render(
        <MemoryRouter>
          <RequestPasswordResetSuccessContainer
            loading={false}
            onRetry={handleRetry}
          />
        </MemoryRouter>
      );

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      const retryButton = screen.getByRole('button', { name: /^Retry$/i });
      expect(retryButton).toBeEnabled();

      act(() => {
        retryButton.click();
      });

      expect(handleRetry).toHaveBeenCalledTimes(1);

      expect(
        screen.getByRole('button', { name: /Retry in 30s/i })
      ).toBeDisabled();
    });

    it('cleans up timer when unmounted', () => {
      const { unmount } = render(
        <MemoryRouter>
          <RequestPasswordResetSuccessContainer
            loading={false}
            onRetry={vi.fn()}
          />
        </MemoryRouter>
      );

      unmount();
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(5000);
        });
      }).not.toThrow();
    });
  });
});
