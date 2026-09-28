import { AuthConsent } from '@/auth/components/auth-consent';
import { GoogleAuthButtonContainer } from '@/auth/components/google-auth-button';
import { SignupForm } from '@/auth/components/signup-form';
import type { ISignupFormValues } from '@/auth/components/signup-form/types';
import { useSignupWithEmail } from '@/auth/hooks/use-signup-with-email';
import emailSentImg from '@/shared/assets/email-sent.svg';
import logoImg from '@/shared/assets/logo.svg';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/card';
import { FieldDescription, FieldSeparator } from '@/shared/components/field';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function SignUpPage() {
  const [success, setSuccess] = useState(false);
  const handleApiError = useApiErrorHandler();
  const { t } = useTranslation('auth');
  const { t: tShared } = useTranslation('shared');

  const { mutateAsync: signup, isPending } = useSignupWithEmail();

  const handleSignup = async (values: ISignupFormValues) => {
    try {
      await signup(values);
      setSuccess(true);
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const account_created_success_title = t('account_created_success_title');
  const check_email_verification_text = t('check_email_verification_text');
  const email_sent_text = t('email_sent_text');
  const create_account_text = t('create_account_text');
  const or_text = t('or_text');
  const already_have_account_text = t('already_have_account_text');
  const sign_in_link_text = t('sign_in_link_text');
  const creating_an_account_action_text = t('creating_an_account_action_text');
  const drimsheet_limited = tShared('drimsheet_limited');

  if (success) {
    return (
      <main className="flex min-h-svh w-full items-center justify-center px-4 py-8">
        <Card className="w-full max-w-sm">
          <CardHeader className="flex flex-col items-center gap-4">
            <img src={emailSentImg} alt={email_sent_text} />
            <CardTitle>
              <h1 className="font-heading text-2xl/4  font-medium">
                {account_created_success_title}
              </h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p role="status" aria-live="polite">
              {check_email_verification_text}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh w-full items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md">
              <img src={logoImg} alt="" className="mb-6 min-w-12 rounded-sm" />
            </div>
            <span className="sr-only">{drimsheet_limited}.</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {create_account_text}
          </h1>
        </div>

        <div className="grid gap-4">
          <GoogleAuthButtonContainer />
        </div>

        <FieldSeparator className="my-4">{or_text}</FieldSeparator>

        <SignupForm onSubmit={handleSignup} loading={isPending} />

        <FieldDescription className="text-center">
          {already_have_account_text}{' '}
          <Link
            to="/auth/signin"
            className="text-primary hover:text-primary/80"
          >
            {sign_in_link_text}
          </Link>
        </FieldDescription>

        <AuthConsent actionText={creating_an_account_action_text} />
      </div>
    </main>
  );
}
