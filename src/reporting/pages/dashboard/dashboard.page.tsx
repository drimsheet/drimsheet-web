import { AppBody } from '@/shared/components/app';
import { PageTitle } from '@/shared/components/page-title';
import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { t } = useTranslation('shared');
  const page_title = t('dashboard');

  return (
    <AppBody>
      <PageTitle>{page_title}</PageTitle>
    </AppBody>
  );
}
