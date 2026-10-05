import type {
  DefaultErrorBoundaryProps,
  DefaultErrorFallbackProps,
  IErrorBoundaryFallbackData,
} from '@/_app/containers/error-boundary/types';
import { Button } from '@/shared/components/button';
import { FeatureNotAvailable } from '@/shared/components/feature-not-available';
import { FullPageLoader } from '@/shared/components/full-page-loader';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { isFeatureFlagApiError } from '@/shared/lib/api';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DefaultErrorFallback = ({
  error,
  resetError,
}: Readonly<DefaultErrorFallbackProps>) => {
  const { t } = useTranslation('shared');
  const [show, setShow] = useState(false);

  useEffect(() => {
    // This is to prevent the error boundary from immediately showing the error fallback
    // for a split second before the full page loader is shown.
    const timer = setTimeout(() => setShow(true), 200);

    return () => clearTimeout(timer);
  }, []);

  const errorMessage = error instanceof Error ? error.message : String(error);

  if (!show) {
    const loading_application_status = t('loading_application_status');

    return <FullPageLoader label={loading_application_status} />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[400px] text-center space-y-4">
      <h2 className="text-2xl font-semibold text-foreground">
        {t('something_went_wrong_title')}
      </h2>
      <p className="text-sm text-muted-foreground w-full max-w-md">
        {t('unexpected_error_description')}
      </p>
      {import.meta.env.DEV && (
        <pre className="text-center w-full max-w-2xl bg-muted p-4 rounded-md overflow-auto text-xs text-muted-foreground mt-4">
          {errorMessage}
        </pre>
      )}
      <Button onClick={resetError} className="mt-4">
        {t('try_again_text')}
      </Button>
    </div>
  );
};

export const DefaultErrorBoundary = ({
  children,
  fallback,
}: Readonly<DefaultErrorBoundaryProps>) => {
  const handleApiError = useApiErrorHandler();

  const renderFallback = (errorData: IErrorBoundaryFallbackData) => {
    if (isFeatureFlagApiError(errorData.error)) {
      return <FeatureNotAvailable />;
    }

    if (typeof fallback === 'function') {
      return fallback(errorData);
    }

    return fallback ?? <DefaultErrorFallback {...errorData} />;
  };

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <SentryErrorBoundary
          onReset={reset}
          fallback={renderFallback}
          onError={(error: unknown) => {
            if (isAxiosError(error)) {
              handleApiError(error, { report: false });
            }
          }}
        >
          {children}
        </SentryErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};
