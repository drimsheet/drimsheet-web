import type { IFeatureFlagGuardProps } from '@/_app/containers/feature-flag-guard/types';
import { useLaunchDarklyContextSynchronization } from '@/_app/containers/launchdarkly';
import { FeatureNotAvailable } from '@/shared/components/feature-not-available';
import { FullPageLoader } from '@/shared/components/full-page-loader';
import { useFeatureFlags } from '@/shared/hooks/use-feature-flag';
import { useTranslation } from 'react-i18next';

export function FeatureFlagGuard({
  children,
  flagKeys,
}: Readonly<IFeatureFlagGuardProps>) {
  const { t } = useTranslation('shared');
  const synchronizationState = useLaunchDarklyContextSynchronization();
  const hasFeatureAccess = useFeatureFlags(flagKeys);
  const loading_application_label = t('loading_application_status');

  const feature_flag_synchronization_error = t(
    'feature_flag_synchronization_error'
  );

  if (flagKeys.length === 0) {
    return <>{children}</>;
  }

  if (synchronizationState.status === 'synchronizing') {
    return <FullPageLoader label={loading_application_label} />;
  }

  if (synchronizationState.status === 'failed') {
    throw new Error(feature_flag_synchronization_error, {
      cause: synchronizationState.error,
    });
  }

  if (!hasFeatureAccess) {
    return <FeatureNotAvailable />;
  }

  return <>{children}</>;
}
