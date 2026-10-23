import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { useTranslation } from 'react-i18next';
import type { CategorySectionErrorProps } from '../types';

export function CategorySectionError({
  title,
}: Readonly<CategorySectionErrorProps>) {
  const { t } = useTranslation('ledger-accounts');
  const error_text = t('categories_load_error_text');

  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{error_text}</AlertDescription>
    </Alert>
  );
}
