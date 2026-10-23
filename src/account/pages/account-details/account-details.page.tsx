import { useLedgerAccount } from '@/account/hooks/use-ledger-account';
import { AppBody } from '@/shared/components/app';
import { PageSection } from '@/shared/components/page-section';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { useSubAccounts } from './hooks/use-sub-accounts';
import { AccountActionsContainer } from './parts/account-actions.container';
import { LedgerAccountSummary } from './parts/account-summary';
import { AccountSummarySkeleton } from './parts/account-summary-skeleton';
import { BankDetailsSkeleton } from './parts/bank-details-skeleton';
import { BankDetailsContainer } from './parts/bank-details.container';
import { RecentTransactionsSkeleton } from './parts/recent-transactions-skeleton';
import { RecentTransactionsContainer } from './parts/recent-transactions.container';
import { SectionError } from './parts/section-error';
import { SubAccountsSkeleton } from './parts/sub-accounts-skeleton';
import { SubAccountsContainer } from './parts/sub-accounts.container';
import { TransactionsChartSkeleton } from './parts/transactions-chart-skeleton';
import { TransactionsChartContainer } from './parts/transactions-chart.container';

export function AccountDetailsPage() {
  const { t } = useTranslation(['ledger-accounts', 'shared']);
  const { accountId = '' } = useParams();
  const accountQuery = useLedgerAccount(accountId);
  const subAccounts = useSubAccounts(accountId);
  const account = accountQuery.data;

  const canShowCashFlow =
    account &&
    !account.isControlAccount &&
    (account.behavior === 'bank' || account.behavior === 'petty_cash');

  const error_title = t('ledger-accounts:details_account_error_title');

  if (
    account &&
    !account.isControlAccount &&
    (account.type === 'revenue' || account.type === 'expense')
  ) {
    return <Navigate replace to={`/categories/${account.id}`} />;
  }

  return (
    <>
      <AppBody>
        <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col">
          {accountQuery.isPending && (
            <>
              <AccountSummarySkeleton />
              <BankDetailsSkeleton />
              <SubAccountsSkeleton />
              <PageSection>
                <TransactionsChartSkeleton />
              </PageSection>
              <RecentTransactionsSkeleton />
            </>
          )}
          {accountQuery.isError && (
            <SectionError
              title={error_title}
              onRetry={() => void accountQuery.refetch()}
            />
          )}
          {accountQuery.isSuccess && account && (
            <>
              <LedgerAccountSummary
                account={account}
                hasSubAccounts={!!subAccounts.data?.length}
                actions={
                  <AccountActionsContainer key={account.id} account={account} />
                }
              />
              {account.behavior === 'bank' && (
                <BankDetailsContainer
                  key={`bank-${account.id}`}
                  accountId={account.id}
                />
              )}
              <SubAccountsContainer
                key={`children-${account.id}`}
                accountId={account.id}
              />
              {canShowCashFlow && (
                <TransactionsChartContainer
                  key={`chart-${account.id}`}
                  accountId={account.id}
                />
              )}
              <RecentTransactionsContainer
                key={`transactions-${account.id}`}
                accountId={account.id}
              />
            </>
          )}
        </div>
      </AppBody>
    </>
  );
}
