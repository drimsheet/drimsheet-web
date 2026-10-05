import { authService } from '@/auth/lib/services/auth.service';
import { FullPageLoader } from '@/shared/components/full-page-loader';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

export function AccessTokenManagerContainer({
  children,
}: Readonly<PropsWithChildren>) {
  const { t } = useTranslation('shared');
  const [isInitializing, setIsInitializing] = useState(true);

  const hasInitialized = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      if (hasInitialized.current) return;

      hasInitialized.current = true;

      await authService.init();
      setIsInitializing(false);
    };

    initialize();
  }, []);

  if (isInitializing) {
    const loading_application_status = t('loading_application_status');

    return <FullPageLoader label={loading_application_status} />;
  }

  return <>{children}</>;
}
