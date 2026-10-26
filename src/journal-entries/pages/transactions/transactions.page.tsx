import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { Button } from '@/shared/components/button';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TransactionActivityContainer } from './parts/transaction-activity.container';
import { TransactionsOverviewContainer } from './parts/transactions-overview.container';

export function TransactionsPage() {
  const { t } = useTranslation(['shared', 'journal-entries']);
  const navigate = useNavigate();

  const handleAddTransaction = async () => {
    await navigate('/transactions/inflow');
  };

  const page_title = t('shared:transactions');
  const all_transactions_heading = t('journal-entries:all_transactions');
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
      <AppSection title={all_transactions_heading}>Table to come</AppSection>
    </AppBody>
  );
}
