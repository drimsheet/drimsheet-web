import { AuthConsent } from '@/auth/components/auth-consent';
import { GoogleAuthButtonContainer } from '@/auth/components/google-auth-button';
import { LoginForm } from '@/auth/components/login-form';
import type { ILoginFormValues } from '@/auth/components/login-form/types';
import { useLoginWithEmail } from '@/auth/hooks/use-login-with-email';
import logoImg from '@/shared/assets/logo.svg';
import { FieldDescription, FieldSeparator } from '@/shared/components/field';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export function SignInPage() {
  const { t } = useTranslation('auth');
  const { t: tShared } = useTranslation('shared');

  const [inFlight, setInFlight] = useState(false);
  const handleApiError = useApiErrorHandler();
  const { mutateAsync: loginWithEmail, isPending } = useLoginWithEmail();
  const navigate = useNavigate();

  const isLoading = inFlight || isPending;

  const handleLogin = async (values: ILoginFormValues) => {
    if (isLoading) return;
    setInFlight(true);
    try {
      await loginWithEmail(values);
      navigate('/dashboard');
    } catch (error) {
      handleApiError(error, {
        showToast: true,
      });
    } finally {
      setInFlight(false);
    }
  };

  const sign_in_text = t('sign_in_text');
  const or_text = t('or_text');
  const no_account_text = t('no_account_text');
  const sign_up_text = t('sign_up_text');
  const logging_in_action_text = t('logging_in_action_text');
  const drimsheet_limited = tShared('drimsheet_limited');

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center">
              <img src={logoImg} alt="" className="mb-6 min-w-12 rounded-sm" />
            </div>
            <span className="sr-only">{drimsheet_limited}</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{sign_in_text}</h1>
        </div>

        <div className="grid gap-4">
          <GoogleAuthButtonContainer />
        </div>

        <FieldSeparator className="my-4">{or_text}</FieldSeparator>

        <LoginForm onSubmit={handleLogin} loading={isLoading} />

        <FieldDescription className="text-center">
          {no_account_text}{' '}
          <Link
            to="/auth/signup"
            className="text-primary hover:text-primary/80"
          >
            {sign_up_text}
          </Link>
        </FieldDescription>

        <AuthConsent actionText={logging_in_action_text} />
      </div>
    </main>
  );
}
