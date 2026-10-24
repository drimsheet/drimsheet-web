import { Button } from '@/shared/components/button';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { EJournalEntrySourceType } from '@/shared/lib/api/Api';
import type { TTransactionSummaryRow, TransactionSummaryProps } from '../types';

function getTitle(
  row: TTransactionSummaryRow,
  t: TFunction<'journal-entries'>
) {
  if (row.direction === EJournalEntrySourceType.Transfer) {
    return t('transactions_table_transfer_summary', {
      sourceAccount: row.sourceAccountName,
      destinationAccount: row.destinationAccountName,
    });
  }

  const summaryKey =
    row.direction === EJournalEntrySourceType.Payment
      ? 'transactions_table_payment_summary'
      : 'transactions_table_receipt_summary';

  if (row.additionalCounterpartyCount === 0) {
    return t(summaryKey, { counterparty: row.firstCounterpartyName });
  }

  return t(`${summaryKey}_with_others`, {
    counterparty: row.firstCounterpartyName,
    count: row.additionalCounterpartyCount,
  });
}

function getDescription(
  row: TTransactionSummaryRow,
  t: TFunction<'journal-entries'>
) {
  if (row.direction === EJournalEntrySourceType.Transfer) {
    return undefined;
  }

  if (row.additionalCategoryCount === 0) {
    return t('transactions_table_category_summary', {
      category: row.firstCategoryName,
    });
  }

  return t('transactions_table_category_summary_with_others', {
    category: row.firstCategoryName,
    count: row.additionalCategoryCount,
  });
}

export function TransactionSummary({
  row,
  onOpen,
}: Readonly<TransactionSummaryProps>) {
  const { t } = useTranslation('journal-entries');
  const title = getTitle(row, t);
  const description = getDescription(row, t);

  return (
    <div className="flex min-w-0 flex-col gap-1 wrap-anywhere">
      {onOpen ? (
        <Button
          variant="link"
          className="h-auto max-w-full justify-start p-0 whitespace-normal text-left"
          onClick={onOpen}
        >
          {title}
        </Button>
      ) : (
        <span>{title}</span>
      )}
      {description && (
        <span className="text-xs text-muted-foreground font-medium">
          {description}
        </span>
      )}
    </div>
  );
}
