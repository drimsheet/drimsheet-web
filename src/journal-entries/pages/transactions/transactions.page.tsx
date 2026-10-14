import { AppBody, AppHeader } from '@/shared/components/app';
import { Button } from '@/shared/components/button';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { TransactionsTableContainer } from './parts/transactions-table.container';

export function TransactionsPage() {
  const { t } = useTranslation(['shared', 'journal-entries']);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClearCategory = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('accountId');
    next.delete('page');
    setSearchParams(next);
  };

  const title = t('shared:transactions');
  const new_transaction_label = t('shared:new_transaction');
  const filter_description = t('journal-entries:category_filter_description');
  const clear_filter_label = t('journal-entries:clear_category_filter_label');

  return (
    <>
      <AppHeader breadcrumbs={[{ label: title }]} />
      <AppBody>
        {searchParams.has('accountId') && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {filter_description}
            </p>
            <Button variant="outline" onClick={handleClearCategory}>
              {clear_filter_label}
            </Button>
          </div>
        )}
        <TransactionsTableContainer
          actionButton={
            <Button asChild>
              <Link to="/transactions/inflow">
                <Plus />
                {new_transaction_label}
              </Link>
            </Button>
          }
        />
      </AppBody>
    </>
  );
}
