import { useLedgerAccount } from '@/account/hooks/use-ledger-account';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { AccountOverviewSkeleton } from './parts/account-overview';
import { AccountOverviewContainer } from './parts/account-overview.container';
import { RecentTransactionsContainer } from './parts/recent-transactions.container';
import { SectionError } from './parts/section-error';

export function AccountDetailsPage() {
  const { t } = useTranslation(['ledger-accounts', 'shared']);
  const { accountId = '' } = useParams();

  const { data: account, isPending, isError } = useLedgerAccount(accountId);

  const transactions_title = t('ledger-accounts:details_transactions_title');
  const overview_title = t('ledger-accounts:details_overview_title');
  const accounts_label = t('shared:accounts');
  const error_title = t('ledger-accounts:details_account_error_title');

  const isUnsupportedAccount =
    account &&
    !account.isControlAccount &&
    (account.type === 'revenue' || account.type === 'expense');

  if (isUnsupportedAccount) {
    return <Navigate replace to={`/categories/${account.id}`} />;
  }

  const breadcrumbs = {
    label: accounts_label,
    link: '/accounts',
    next: account ? { label: account.name } : undefined,
  };

  if (isError) {
    return (
      <AppBody breadcrumbs={breadcrumbs}>
        <AppSection>
          <SectionError title={error_title} />
        </AppSection>
      </AppBody>
    );
  }

  return (
    <AppBody breadcrumbs={breadcrumbs}>
      <AppSection title={overview_title}>
        {isPending ? (
          <AccountOverviewSkeleton />
        ) : (
          account && (
            <AccountOverviewContainer key={account.id} account={account} />
          )
        )}
      </AppSection>

      <AppSection title={transactions_title}>
        <RecentTransactionsContainer
          key={account?.id}
          accountId={account?.id}
          loading={isPending}
        />
      </AppSection>
    </AppBody>
  );
}
