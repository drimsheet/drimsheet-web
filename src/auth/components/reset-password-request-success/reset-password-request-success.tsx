import { Button } from '@/shared/components/button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { RequestPasswordResetSuccessProps } from './types';

export function RequestPasswordResetSuccess({
  countdown,
  loading,
  onRetry,
  signInHref = '/auth/signin',
}: Readonly<RequestPasswordResetSuccessProps>) {
  const { t } = useTranslation('auth');

  const didnt_receive_it_text = t('didnt_receive_it_text');
  const retry_text = t('retry_text');
  const back_to_sign_in_text = t('back_to_sign_in_text');
  const retry_in_text = t('retry_in_text', { countdown });

  const isRetryDisabled = countdown > 0 || loading;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{didnt_receive_it_text}</p>
        <Button
          type="button"
          onClick={onRetry}
          loading={loading}
          disabled={isRetryDisabled}
          className="w-full"
        >
          {countdown > 0 ? retry_in_text : retry_text}
        </Button>
      </div>

      <Link
        to={signInHref}
        className="text-link hover:text-link/80 text-sm font-medium"
      >
        {back_to_sign_in_text}
      </Link>
    </div>
  );
}
