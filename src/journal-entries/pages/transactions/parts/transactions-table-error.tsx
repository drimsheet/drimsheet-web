import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { useTranslation } from 'react-i18next';

export function TransactionsTableError() {
  const { t } = useTranslation('journal-entries');
  const error_title = t('transactions_table_error_title');
  const error_description = t('overview_error_description');

  return (
    <Alert variant="destructive">
      <AlertTitle>{error_title}</AlertTitle>
      <AlertDescription>{error_description}</AlertDescription>
    </Alert>
  );
}
