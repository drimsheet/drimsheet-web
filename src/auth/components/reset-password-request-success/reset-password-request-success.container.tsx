import { useCallback, useEffect, useState } from 'react';
import { RequestPasswordResetSuccess } from './reset-password-request-success';
import type { RequestPasswordResetSuccessContainerProps } from './types';

export function RequestPasswordResetSuccessContainer({
  onRetry,
  loading,
  signInHref,
}: Readonly<RequestPasswordResetSuccessContainerProps>) {
  const [countdown, setCountdown] = useState<number>(30);

  const handleRetry = useCallback(() => {
    if (countdown > 0 || loading) return;

    setCountdown(30);
    void onRetry();
  }, [countdown, loading, onRetry]);

  const hasTimeRemaining = countdown > 0;

  useEffect(() => {
    if (!hasTimeRemaining) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [hasTimeRemaining]);

  return (
    <RequestPasswordResetSuccess
      countdown={countdown}
      loading={loading}
      onRetry={handleRetry}
      signInHref={signInHref}
    />
  );
}
