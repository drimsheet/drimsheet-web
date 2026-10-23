import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { RequestPasswordResetSuccessProps } from './types';

export function RequestPasswordResetSuccess({
  signInHref = '/auth/signin',
}: Readonly<RequestPasswordResetSuccessProps>) {
  const { t } = useTranslation('auth');

  const back_to_sign_in_text = t('back_to_sign_in_text');

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 text-center">
      <Link
        to={signInHref}
        className="text-link hover:text-link/80 text-sm font-medium"
      >
        {back_to_sign_in_text}
      </Link>
    </div>
  );
}
