import { RequestPasswordResetForm } from '@/auth/components/request-password-reset-form';
import { RequestPasswordResetSuccess } from '@/auth/components/reset-password-request-success';
import { useRequestPasswordReset } from '@/auth/hooks/use-request-password-reset';
import { BrandLogo } from '@/shared/components/brand-logo';
import { PageTitle } from '@/shared/components/page-title';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function RequestPasswordResetPage() {
  const { t } = useTranslation('auth');
  const { t: tShared } = useTranslation('shared');
  const handleApiError = useApiErrorHandler();

  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [inFlight, setInFlight] = useState<boolean>(false);

  const { mutateAsync: requestPasswordReset } = useRequestPasswordReset();

  const password_reset_link_sent_text = t('password_reset_link_sent_text');
  const reset_password_title = t('reset_password_title');
  const reset_password_description = t('reset_password_description');
  const email_sent_text = t('email_sent_text');
  const drimsheet_limited = tShared('drimsheet_limited');

  const handleRequestReset = async (email: string) => {
    if (inFlight) return;

    setInFlight(true);
    try {
      await requestPasswordReset(email);
      setSubmittedEmail(email);
      toast.success(password_reset_link_sent_text);
    } catch (error) {
      handleApiError(error, {
        showToast: true,
      });
    } finally {
      setInFlight(false);
    }
  };

  const isSuccess = Boolean(submittedEmail);

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" className="flex flex-col items-center gap-2 font-medium">
            <BrandLogo alt="" className="mb-2 w-48" />
            <span className="sr-only">{drimsheet_limited}</span>
          </Link>
        </div>

        <div>
          <PageTitle className="text-center">
            {isSuccess ? email_sent_text : reset_password_title}
          </PageTitle>
          {isSuccess ? (
            <div role="status" aria-live="polite" className="mt-2">
              <p className="text-sm text-muted-foreground">
                {password_reset_link_sent_text}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {reset_password_description}
            </p>
          )}
        </div>

        <div>
          {isSuccess ? (
            <RequestPasswordResetSuccess />
          ) : (
            <RequestPasswordResetForm
              onSubmit={(values) => handleRequestReset(values.email)}
              loading={inFlight}
            />
          )}
        </div>
      </div>
    </main>
  );
}
