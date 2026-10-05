import { anonymousLaunchDarklyContext } from '@/_app/containers/launchdarkly/launchdarkly';
import {
  LaunchDarklyContextSynchronizationContext,
  launchDarklySynchronizationState,
} from '@/_app/containers/launchdarkly/launchdarkly-context-synchronization';
import type { ULaunchDarklyContextSynchronizationState } from '@/_app/containers/launchdarkly/types';
import { authService } from '@/auth/lib/services/auth.service';
import type { IUserProfileDto } from '@/shared/lib/api/Api';
import { observabilityService } from '@/shared/lib/services/observability.service';
import { useProfile } from '@/user/hooks/use-profile';
import { useLDClient, type LDContext } from '@launchdarkly/react-sdk';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface ISynchronizationRecord {
  readonly fingerprint?: string;
  readonly state: ULaunchDarklyContextSynchronizationState;
}

function getContextFingerprint(profile?: IUserProfileDto) {
  return profile?.email ?? 'anonymous';
}

export function LaunchDarklyContextSynchronizerContainer({
  children,
}: Readonly<PropsWithChildren>) {
  const { t } = useTranslation('shared');
  const ldClient = useLDClient();
  const location = useLocation();
  const isAuthenticated = authService.isLoggedIn();

  const { data: profile, error: profileError } = useProfile({
    enabled: isAuthenticated,
  });

  const feature_flag_synchronization_error = t(
    'feature_flag_synchronization_error'
  );

  const [synchronizationRecord, setSynchronizationRecord] =
    useState<ISynchronizationRecord>({
      state: launchDarklySynchronizationState,
    });

  let expectedFingerprint: string | undefined;
  if (!isAuthenticated) {
    expectedFingerprint = getContextFingerprint();
  } else if (profile) {
    expectedFingerprint = getContextFingerprint(profile);
  }

  const renderedContext = ldClient.getContext();

  const renderedContextMatches = !isAuthenticated
    ? Boolean(
        renderedContext &&
        'anonymous' in renderedContext &&
        renderedContext.anonymous === true
      )
    : Boolean(
        profile &&
        renderedContext &&
        'key' in renderedContext &&
        renderedContext.key === profile.email &&
        'email' in renderedContext &&
        renderedContext.email === profile.email
      );

  useEffect(() => {
    let isCurrent = true;

    if (profileError) {
      return;
    }

    const currentContext = ldClient.getContext();

    let nextContext: LDContext;

    if (!isAuthenticated) {
      if (
        currentContext &&
        'anonymous' in currentContext &&
        currentContext.anonymous === true
      ) {
        return;
      }

      nextContext = anonymousLaunchDarklyContext;
    } else {
      if (
        !profile ||
        (currentContext &&
          'key' in currentContext &&
          currentContext.key === profile.email &&
          'email' in currentContext &&
          currentContext.email === profile.email)
      ) {
        return;
      }

      nextContext = {
        kind: 'user',
        key: profile.email,
        email: profile.email,
        _meta: {
          privateAttributes: ['email'],
        },
      };
    }

    void ldClient
      .identify(nextContext)
      .then((result) => {
        if (!isCurrent) {
          return;
        }

        if (result.status === 'error') {
          observabilityService.report(result.error, {
            source: 'launchdarkly-context-synchronizer',
          });
          setSynchronizationRecord({
            fingerprint: expectedFingerprint,
            state: { status: 'failed', error: result.error },
          });

          return;
        }

        setSynchronizationRecord({
          fingerprint: expectedFingerprint,
          state: { status: 'ready' },
        });
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return;
        }

        const synchronizationError =
          error instanceof Error
            ? error
            : new Error(feature_flag_synchronization_error, {
                cause: error,
              });

        observabilityService.report(synchronizationError, {
          source: 'launchdarkly-context-synchronizer',
        });
        setSynchronizationRecord({
          fingerprint: expectedFingerprint,
          state: { status: 'failed', error: synchronizationError },
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [
    expectedFingerprint,
    feature_flag_synchronization_error,
    isAuthenticated,
    ldClient,
    location.key,
    profile,
    profileError,
  ]);

  let synchronizationState: ULaunchDarklyContextSynchronizationState =
    launchDarklySynchronizationState;

  if (profileError) {
    synchronizationState = { status: 'failed', error: profileError };
  } else if (renderedContextMatches) {
    synchronizationState = { status: 'ready' };
  } else if (
    expectedFingerprint &&
    synchronizationRecord.fingerprint === expectedFingerprint
  ) {
    synchronizationState = synchronizationRecord.state;
  }

  return (
    <LaunchDarklyContextSynchronizationContext.Provider
      value={synchronizationState}
    >
      {children}
    </LaunchDarklyContextSynchronizationContext.Provider>
  );
}
