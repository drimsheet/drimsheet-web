import { StatusBadge } from '@/shared/components/status-badge';
import { useTranslation } from 'react-i18next';
import type { CategoryMetadataProps } from '../types';

export function CategoryMetadata({ account }: Readonly<CategoryMetadataProps>) {
  const { t } = useTranslation('ledger-accounts');

  const type_label = t(
    account.type === 'revenue'
      ? 'categories_type_revenue'
      : 'categories_type_expense'
  );

  return <StatusBadge variant="neutral" label={type_label} />;
}
