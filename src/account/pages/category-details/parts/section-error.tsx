import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { useTranslation } from 'react-i18next';

export function CategoryDetailsError() {
  const { t } = useTranslation('ledger-accounts');
  const title = t('category_details_error_title');
  const description = t('details_load_error_text');

  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
