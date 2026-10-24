import { AppBody } from '@/shared/components/app';
import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { t } = useTranslation('shared');
  const page_title = t('dashboard');

  return <AppBody title={page_title}></AppBody>;
}
