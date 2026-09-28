import { authService } from '@/auth/lib/services/auth.service';
import { FullPageLoader } from '@/shared/components/full-page-loader';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export function OAuthConfirmationPage() {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hasStartedCompletion = useRef(false);

  useEffect(() => {
    const handleFailure = () => {
      const oauth_sign_in_failed_text = t('oauth_sign_in_failed_text');

      navigate('/auth/signin', { replace: true });
      queueMicrotask(() => toast.error(oauth_sign_in_failed_text));
    };

    const handleCompleteSignIn = async () => {
      if (hasStartedCompletion.current) return;
      hasStartedCompletion.current = true;

      if (searchParams.toString()) {
        handleFailure();
        return;
      }

      try {
        await authService.getAccessToken();
        navigate('/dashboard', { replace: true });
      } catch {
        handleFailure();
      }
    };

    handleCompleteSignIn();
  }, [searchParams, navigate, t]);

  const completing_sign_in_status = t('completing_sign_in_status');

  return (
    <main className="min-h-svh w-full" aria-busy="true">
      <FullPageLoader label={completing_sign_in_status} />
    </main>
  );
}
