import { useVerifyEmail } from '@/auth/hooks/use-verify-email';
import { FullPageLoader } from '@/shared/components/full-page-loader';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export function CompleteSignUpPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const hasCalled = useRef(false);

  const handleApiError = useApiErrorHandler();
  const { mutateAsync: verifyEmail } = useVerifyEmail();

  const token = searchParams.get('token');

  useEffect(() => {
    const handleVerifyEmail = async () => {
      if (hasCalled.current) return;
      hasCalled.current = true;

      if (!token) {
        const invalid_verification_link_text = t(
          'invalid_verification_link_text'
        );
        navigate('/auth/signup', { replace: true });
        queueMicrotask(() => toast.error(invalid_verification_link_text));
        return;
      }

      try {
        await verifyEmail(token);

        const email_verified_success_text = t('email_verified_success_text');
        toast.success(email_verified_success_text);
        navigate('/dashboard', { replace: true });
      } catch (error) {
        handleApiError(error, { showToast: true });
        navigate('/auth/signup', { replace: true });
      }
    };

    handleVerifyEmail();
  }, [token, verifyEmail, navigate, t, handleApiError]);

  const verifying_email_status = t('verifying_email_status');

  return (
    <main className="min-h-svh w-full" aria-busy="true">
      <FullPageLoader label={verifying_email_status} />
    </main>
  );
}
