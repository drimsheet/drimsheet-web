import { useBoolVariation } from '@launchdarkly/react-sdk';

export const featureFlagKeys = {
  accessAlpha1: 'v_0_1_0_alpha_1',
} as const;

export type UFeatureFlagKey =
  (typeof featureFlagKeys)[keyof typeof featureFlagKeys];

type TFeatureFlagValues = Record<UFeatureFlagKey, boolean>;

export function useFeatureFlags(requiredFlagKeys: readonly UFeatureFlagKey[]) {
  const featureFlagValues: TFeatureFlagValues = {
    [featureFlagKeys.accessAlpha1]: useBoolVariation(
      featureFlagKeys.accessAlpha1,
      false
    ),
  };

  return requiredFlagKeys.every((flagKey) => featureFlagValues[flagKey]);
}
