import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { Button } from '@/shared/components/button';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RecentTransactionsTableContainer } from './parts/recent-transactions-table.container';
import { TransactionActivityContainer } from './parts/transaction-activity.container';
import { TransactionsOverviewContainer } from './parts/transactions-overview.container';

export function TransactionsPage() {
  const { t } = useTranslation(['shared', 'journal-entries']);
  const navigate = useNavigate();

  const handleAddTransaction = async () => {
    await navigate('/transactions/inflow');
  };

  const page_title = t('shared:transactions');

  const recent_transactions_heading = t(
    'journal-entries:recent_transactions_title'
  );

  const overview = t('journal-entries:overview');

  return (
    <AppBody
      title={page_title}
      actionsSlot={
        <Button onClick={handleAddTransaction}>
          <PlusIcon />
          {t('journal-entries:add_transaction')}
        </Button>
      }
    >
      <AppSection title={overview}>
        <TransactionsOverviewContainer />
        <TransactionActivityContainer />
      </AppSection>
      <AppSection title={recent_transactions_heading}>
        <RecentTransactionsTableContainer />
      </AppSection>
    </AppBody>
  );
}
