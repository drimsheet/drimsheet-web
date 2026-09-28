import { AppBody, AppHeader } from '@/shared/components/app';
import { Button } from '@/shared/components/button';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TransactionsTableContainer } from './parts/transactions-table.container';

export function TransactionsPage() {
  const { t } = useTranslation('shared');

  return (
    <>
      <AppHeader breadcrumbs={[{ label: t('transactions') }]} />
      <AppBody>
        <TransactionsTableContainer
          actionButton={
            <Button asChild>
              <Link to="/transactions/inflow">
                <Plus />
                {t('new_transaction')}
              </Link>
            </Button>
          }
        />
      </AppBody>
    </>
  );
}
