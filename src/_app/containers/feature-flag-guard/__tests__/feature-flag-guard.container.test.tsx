import { FeatureFlagGuard } from '@/_app/containers/feature-flag-guard';
import { useLaunchDarklyContextSynchronization } from '@/_app/containers/launchdarkly';
import {
  featureFlagKeys,
  useFeatureFlags,
} from '@/shared/hooks/use-feature-flag';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/_app/containers/launchdarkly', () => ({
  useLaunchDarklyContextSynchronization: vi.fn(),
}));

vi.mock('@/shared/hooks/use-feature-flag', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/shared/hooks/use-feature-flag')>();

  return {
    ...original,
    useFeatureFlags: vi.fn(),
  };
});

describe('FeatureFlagGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLaunchDarklyContextSynchronization).mockReturnValue({
      status: 'ready',
    });
    vi.mocked(useFeatureFlags).mockReturnValue(true);
  });

  it('renders children when no flags are required', () => {
    vi.mocked(useLaunchDarklyContextSynchronization).mockReturnValue({
      status: 'synchronizing',
    });

    render(
      <FeatureFlagGuard flagKeys={[]}>
        <p>Protected content</p>
      </FeatureFlagGuard>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(useFeatureFlags).toHaveBeenCalledWith([]);
  });

  it('shows a loader while the authenticated context is synchronizing', () => {
    vi.mocked(useLaunchDarklyContextSynchronization).mockReturnValue({
      status: 'synchronizing',
    });

    render(
      <FeatureFlagGuard flagKeys={[featureFlagKeys.accessAlpha1]}>
        <p>Protected content</p>
      </FeatureFlagGuard>
    );

    expect(
      within(screen.getByRole('status')).getByText('Loading Drimsheet')
    ).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('throws a synchronization failure for the application error boundary', () => {
    const error = new Error('identify failed');
    vi.mocked(useLaunchDarklyContextSynchronization).mockReturnValue({
      status: 'failed',
      error,
    });

    expect(() =>
      render(
        <FeatureFlagGuard flagKeys={[featureFlagKeys.accessAlpha1]}>
          <p>Protected content</p>
        </FeatureFlagGuard>
      )
    ).toThrow('Unable to verify feature access.');
  });

  it('renders children when every required flag is enabled', () => {
    vi.mocked(useFeatureFlags).mockReturnValue(true);

    const requiredFlagKeys = [
      featureFlagKeys.accessAlpha1,
      featureFlagKeys.accessAlpha1,
    ] as const;

    render(
      <FeatureFlagGuard flagKeys={requiredFlagKeys}>
        <p>Protected content</p>
      </FeatureFlagGuard>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(useFeatureFlags).toHaveBeenCalledOnce();
    expect(useFeatureFlags).toHaveBeenCalledWith(requiredFlagKeys);
  });

  it('renders the unavailable state and never mounts denied children', () => {
    const onMount = vi.fn();
    vi.mocked(useFeatureFlags).mockReturnValue(false);

    function ProtectedContent() {
      onMount();

      return <p>Protected content</p>;
    }

    render(
      <FeatureFlagGuard
        flagKeys={[featureFlagKeys.accessAlpha1, featureFlagKeys.accessAlpha1]}
      >
        <ProtectedContent />
      </FeatureFlagGuard>
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: "This feature isn't available to you",
      })
    ).toBeInTheDocument();
    expect(onMount).not.toHaveBeenCalled();
    expect(useFeatureFlags).toHaveBeenCalledWith([
      featureFlagKeys.accessAlpha1,
      featureFlagKeys.accessAlpha1,
    ]);
  });
});
