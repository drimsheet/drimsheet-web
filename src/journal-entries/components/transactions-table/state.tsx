import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { DataTableSkeleton } from '@/shared/components/data-table';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { useTranslation } from 'react-i18next';
import type {
  TransactionsTableSkeletonProps,
  TransactionsTableWithStateProps,
} from './types';

export function TransactionsTableSkeleton({
  showRecordedOn = false,
}: Readonly<TransactionsTableSkeletonProps>) {
  const { t } = useTranslation('journal-entries');
  const loading_status = t('transactions_table_loading_status');

  return (
    <div className="flex min-w-0 w-full flex-col gap-4" aria-busy="true">
      <output className="sr-only">{loading_status}</output>
      <DataTableSkeleton columnsCount={showRecordedOn ? 7 : 6} />
    </div>
  );
}

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

export function TransactionsTableWithState({
  loading,
  error,
  showRecordedOn,
  children,
}: Readonly<TransactionsTableWithStateProps>) {
  let state: 'loading' | 'error' | 'success' = 'success';
  if (loading) {
    state = 'loading';
  } else if (error) {
    state = 'error';
  }

  return (
    <WithTransitionState
      state={state}
      data={true}
      loading={<TransactionsTableSkeleton showRecordedOn={showRecordedOn} />}
      error={<TransactionsTableError />}
    >
      {() => children}
    </WithTransitionState>
  );
}
