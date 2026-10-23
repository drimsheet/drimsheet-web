import { CashTransactionFormSkeleton } from '@/journal-entries/components/cash-transaction-form';
import {
  CashTransferFormContainer,
  CashTransferFormSkeleton,
} from '@/journal-entries/components/cash-transfer-form';
import { InflowFormContainer } from '@/journal-entries/components/inflow-form';
import { JournalEntryNotFound } from '@/journal-entries/components/journal-entry-not-found';
import { OutflowFormContainer } from '@/journal-entries/components/outflow-form';
import { useJournalEntry } from '@/journal-entries/hooks/use-journal-entry';
import { journalEntryRouteMapper } from '@/journal-entries/lib/mappers/journal-entry-route.mapper';
import { AppBody } from '@/shared/components/app';
import { PageSection } from '@/shared/components/page-section';
import { PageTitle } from '@/shared/components/page-title';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

export function EditTransactionPage() {
  const { t } = useTranslation('journal-entries');
  const page_title = t('edit_transaction_title');
  const navigate = useNavigate();
  const { type, id } = useParams<{ type: string; id: string }>();
  const routeSourceType = journalEntryRouteMapper.toSourceType(type);

  const {
    data: journalEntry,
    isError,
    isPending,
  } = useJournalEntry(routeSourceType ? id : undefined);

  const handleBack = () => navigate('/transactions');

  if (!id || !routeSourceType) {
    return <Navigate replace to="/transactions" />;
  }

  if (isPending) {
    return (
      <>
        <AppBody>
          <PageTitle>{page_title}</PageTitle>
          <PageSection>
            {type === 'transfer' ? (
              <CashTransferFormSkeleton />
            ) : (
              <CashTransactionFormSkeleton />
            )}
          </PageSection>
        </AppBody>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <AppBody>
          <PageSection>
            <JournalEntryNotFound onBack={handleBack} />
          </PageSection>
        </AppBody>
      </>
    );
  }

  if (!journalEntry) return <Navigate replace to="/transactions" />;

  const canonicalType = journalEntryRouteMapper.toRouteType(
    journalEntry.sourceType
  );

  if (!canonicalType) return <Navigate replace to="/transactions" />;

  if (journalEntry.sourceType !== routeSourceType) {
    return (
      <Navigate
        replace
        to={`/transactions/${canonicalType}/${journalEntry.id}/edit`}
      />
    );
  }

  return (
    <>
      <AppBody>
        <PageTitle>{page_title}</PageTitle>
        <PageSection>
          {canonicalType === 'inflow' && (
            <InflowFormContainer journalEntry={journalEntry} />
          )}
          {canonicalType === 'outflow' && (
            <OutflowFormContainer journalEntry={journalEntry} />
          )}
          {canonicalType === 'transfer' && (
            <CashTransferFormContainer journalEntry={journalEntry} />
          )}
        </PageSection>
      </AppBody>
    </>
  );
}
