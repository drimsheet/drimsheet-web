import {
  featureFlagKeys,
  useFeatureFlags,
} from '@/shared/hooks/use-feature-flags';

export function useCanAccessAlpha1() {
  return useFeatureFlags([featureFlagKeys.accessAlpha1]);
}
