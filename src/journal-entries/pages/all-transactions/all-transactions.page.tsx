import { AppBody } from '@/shared/components/app';
import { useTranslation } from 'react-i18next';

export function AllTransactionsPage() {
  const { t } = useTranslation('journal-entries');
  const placeholder_title = t('all_transactions_placeholder_title');

  return <AppBody title={placeholder_title} />;
}
