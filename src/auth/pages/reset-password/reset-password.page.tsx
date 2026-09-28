import {
  ResetPasswordForm,
  type ResetPasswordFormProps,
} from '@/auth/components/reset-password-form';
import { useResetPassword } from '@/auth/hooks/use-reset-password';
import logoImg from '@/shared/assets/logo.svg';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import type { IApiValidationError } from '@/shared/lib/api/Api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export function ResetPasswordPage() {
  const { t } = useTranslation('auth');
  const { t: tShared } = useTranslation('shared');
  const navigate = useNavigate();
  const handleApiError = useApiErrorHandler();

  const [inFlight, setInFlight] = useState<boolean>(false);
  const { mutateAsync: resetPassword, isPending } = useResetPassword();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const handleSubmit: ResetPasswordFormProps['onSubmit'] = async (
    values,
    helpers
  ) => {
    if (inFlight || isPending) return;
    setInFlight(true);
    try {
      await resetPassword({
        ...values,
        token,
      });
      toast.success(t('password_reset_success_text'));
      navigate('/dashboard');
    } catch (error) {
      const setValidationError = (errors: IApiValidationError[]) => {
        errors.forEach((err) => {
          helpers.setFieldError(err.field, err.message);
        });
      };

      handleApiError(error, {
        showToast: true,
        setValidationError,
      });
    } finally {
      setInFlight(false);
    }
  };

  const reset_password_title = t('reset_password_title');
  const back_to_sign_in_text = t('back_to_sign_in_text');
  const invalid_link_text = t('invalid_verification_link_text');
  const drimsheet_limited = tShared('drimsheet_limited');

  const isLoading = inFlight || isPending;
  const isTokenMissing = !token;

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" className="flex flex-col items-center gap-2 font-medium">
            <div className="mb-1 flex size-8 items-center justify-center rounded-md">
              <img src={logoImg} alt="" className="mb-6 min-w-12 rounded-sm" />
            </div>
            <span className="sr-only">{drimsheet_limited}</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-center tracking-tight">
          {reset_password_title}
        </h1>
        {isTokenMissing ? (
          <div role="alert" className="flex flex-col gap-4 text-center">
            <p className="text-sm font-medium text-destructive">
              {invalid_link_text}
            </p>
            <Link
              to="/auth/forgot-password"
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              {t('get_password_reset_link_text')}
            </Link>
          </div>
        ) : (
          <div>
            <ResetPasswordForm onSubmit={handleSubmit} loading={isLoading} />
          </div>
        )}
        <div className="flex justify-center text-center">
          <Link
            to="/auth/signin"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            {back_to_sign_in_text}
          </Link>
        </div>
      </div>
    </main>
  );
}
