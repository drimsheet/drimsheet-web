import { DataTableSkeleton } from '@/shared/components/data-table';
import { useTranslation } from 'react-i18next';

export function TransactionsTableSkeleton() {
  const { t } = useTranslation('journal-entries');

  const loading_status = t('transactions_table_loading_status');

  return (
    <div className="flex min-w-0 w-full flex-col gap-4" aria-busy="true">
      <output className="sr-only">{loading_status}</output>
      <DataTableSkeleton columnsCount={6} />
    </div>
  );
}
