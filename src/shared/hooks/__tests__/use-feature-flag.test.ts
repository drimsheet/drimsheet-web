import { useCanAccessAlpha1 } from '@/shared/hooks/use-can-access-alpha1';
import {
  featureFlagKeys,
  useFeatureFlags,
} from '@/shared/hooks/use-feature-flags';
import { useBoolVariation } from '@launchdarkly/react-sdk';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@launchdarkly/react-sdk', () => ({
  useBoolVariation: vi.fn(),
}));

describe('feature flag hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the access-alpha-1 flag value', () => {
    vi.mocked(useBoolVariation).mockReturnValue(true);

    const { result } = renderHook(() => useCanAccessAlpha1());

    expect(result.current).toBe(true);
    expect(useBoolVariation).toHaveBeenCalledWith(
      featureFlagKeys.accessAlpha1,
      false
    );
  });

  it('returns true when every required feature flag is enabled', () => {
    vi.mocked(useBoolVariation).mockReturnValue(true);

    const { result } = renderHook(() =>
      useFeatureFlags([
        featureFlagKeys.accessAlpha1,
        featureFlagKeys.accessAlpha1,
      ])
    );

    expect(result.current).toBe(true);
  });

  it('returns false when a required feature flag is disabled', () => {
    vi.mocked(useBoolVariation).mockReturnValue(false);

    const { result } = renderHook(() =>
      useFeatureFlags([featureFlagKeys.accessAlpha1])
    );

    expect(result.current).toBe(false);
    expect(useBoolVariation).toHaveBeenCalledWith(
      featureFlagKeys.accessAlpha1,
      false
    );
  });

  it('returns true when no feature flags are required', () => {
    vi.mocked(useBoolVariation).mockReturnValue(false);

    const { result } = renderHook(() => useFeatureFlags([]));

    expect(result.current).toBe(true);
  });
});
