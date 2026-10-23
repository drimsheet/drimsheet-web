import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/empty';
import { PageSection } from '@/shared/components/page-section';
import { ReceiptText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RecentTransactionsProps } from '../types';

export function RecentTransactions({
  counterpartyName,
  empty,
  children,
}: Readonly<RecentTransactionsProps>) {
  const { t } = useTranslation('counterparty');
  const title = t('recent_transactions_title');
  const empty_title = t('no_transactions_title');

  const empty_description = t('no_transactions_description', {
    name: counterpartyName,
  });

  return (
    <PageSection title={title}>
      {empty && (
        <Empty className="bg-muted/20 px-6 py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptText aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>
              <h3>{empty_title}</h3>
            </EmptyTitle>
            <EmptyDescription>{empty_description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {!empty && children}
    </PageSection>
  );
}
