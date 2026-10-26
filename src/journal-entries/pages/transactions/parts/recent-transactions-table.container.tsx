import {
  TransactionsTable,
  TransactionsTableSkeleton,
} from '@/journal-entries/components/transactions-table';
import { useArchiveJournalEntry } from '@/journal-entries/hooks/use-archive-journal-entry';
import { useDeleteJournalEntry } from '@/journal-entries/hooks/use-delete-journal-entry';
import { useJournalEntries } from '@/journal-entries/hooks/use-journal-entries';
import { journalEntryRouteMapper } from '@/journal-entries/lib/mappers/journal-entry-route.mapper';
import { Button } from '@/shared/components/button';
import type { IJournalEntryListDto } from '@/shared/lib/api/Api';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { TransactionsTableError } from './transactions-table-error';

export function RecentTransactionsTableContainer() {
  const navigate = useNavigate();
  const { t } = useTranslation('journal-entries');
  const archive = useArchiveJournalEntry();
  const remove = useDeleteJournalEntry();

  const transactions = useJournalEntries(
    { page: 1, limit: 15, orderBy: 'effectiveDate', sortDirection: 'desc' },
    { throwOnError: false }
  );

  function handleEdit(entry: IJournalEntryListDto) {
    const type = journalEntryRouteMapper.toRouteType(entry.sourceType);
    if (type) {
      void navigate(`/transactions/${type}/${entry.id}/edit`);
    }
  }

  async function handleArchive(entry: IJournalEntryListDto) {
    await archive.mutateAsync(entry.id);
  }

  async function handleDelete(entry: IJournalEntryListDto) {
    await remove.mutateAsync(entry.id);
  }

  if (transactions.isPending) {
    return <TransactionsTableSkeleton />;
  }

  if (transactions.isError || !transactions.data) {
    return <TransactionsTableError />;
  }

  const view_all_label = t('view_all_transactions_action');

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <TransactionsTable
        sortable={false}
        data={transactions.data.data.slice(0, 15)}
        currentSortDirection="desc"
        archiving={archive.isPending}
        onEditTransaction={handleEdit}
        onArchiveTransaction={handleArchive}
        onDeleteTransaction={handleDelete}
      />
      <div className="flex justify-end">
        <Button variant="link" asChild>
          <Link to="/transactions/all">
            {view_all_label}
            <ArrowRight aria-hidden data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
