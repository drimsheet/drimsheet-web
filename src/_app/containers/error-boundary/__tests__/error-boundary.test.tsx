import { DefaultErrorBoundary } from '@/_app/containers/error-boundary/error-boundary';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { handleApiError, isFeatureFlagApiError } = vi.hoisted(() => ({
  handleApiError: vi.fn(),
  isFeatureFlagApiError: vi.fn(),
}));

vi.mock('@/shared/hooks/use-api-error-handler', () => ({
  useApiErrorHandler: () => handleApiError,
}));

vi.mock('@/shared/lib/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/shared/lib/api')>();

  return {
    ...original,
    isFeatureFlagApiError,
  };
});

function ExplodingChild(): never {
  throw new Error('boom');
}

describe('DefaultErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isFeatureFlagApiError.mockReturnValue(false);
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders translated fallback copy after the loader delay', async () => {
    render(
      <DefaultErrorBoundary>
        <ExplodingChild />
      </DefaultErrorBoundary>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'An unexpected error occurred. Our technical team has been notified.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try Again' })
    ).toBeInTheDocument();
  });

  it('resets the boundary through the localized fallback action', async () => {
    vi.useRealTimers();
    let shouldThrow = true;
    const user = userEvent.setup();

    function RecoverableChild() {
      if (shouldThrow) throw new Error('recoverable');

      return <p>Application recovered</p>;
    }

    render(
      <DefaultErrorBoundary>
        <RecoverableChild />
      </DefaultErrorBoundary>
    );

    await screen.findByRole('button', { name: 'Try Again' });
    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(screen.getByText('Application recovered')).toBeInTheDocument();
  });

  it('preserves Axios UI handling without asking the hook to report again', () => {
    const axiosError = new AxiosError('Core request failed');

    function AxiosExplodingChild(): never {
      throw axiosError;
    }

    render(
      <DefaultErrorBoundary>
        <AxiosExplodingChild />
      </DefaultErrorBoundary>
    );

    expect(handleApiError).toHaveBeenCalledWith(axiosError, { report: false });
  });

  it('renders the feature unavailable state for a Core feature-flag error', () => {
    const featureFlagError = new Error('Feature access denied');
    isFeatureFlagApiError.mockImplementation(
      (error) => error === featureFlagError
    );

    function FeatureFlagExplodingChild(): never {
      throw featureFlagError;
    }

    render(
      <DefaultErrorBoundary>
        <FeatureFlagExplodingChild />
      </DefaultErrorBoundary>
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: "This feature isn't available to you",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Request access' })
    ).toBeInTheDocument();
  });

  it('gives the feature unavailable state precedence over a custom fallback', () => {
    const featureFlagError = new Error('Feature access denied');
    isFeatureFlagApiError.mockImplementation(
      (error) => error === featureFlagError
    );

    function FeatureFlagExplodingChild(): never {
      throw featureFlagError;
    }

    render(
      <DefaultErrorBoundary fallback={<p>Custom fallback</p>}>
        <FeatureFlagExplodingChild />
      </DefaultErrorBoundary>
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: "This feature isn't available to you",
      })
    ).toBeInTheDocument();
    expect(screen.queryByText('Custom fallback')).not.toBeInTheDocument();
  });

  it('does not manually route a non-Axios render failure a second time', () => {
    render(
      <DefaultErrorBoundary>
        <ExplodingChild />
      </DefaultErrorBoundary>
    );

    expect(handleApiError).not.toHaveBeenCalled();
  });
});
