import { useLedgerAccount } from '@/account/hooks/use-ledger-account';
import { useSubAccounts } from '@/account/hooks/use-sub-accounts';
import { AppBody } from '@/shared/components/app';
import { PageSection } from '@/shared/components/page-section';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { AccountActionsContainer } from './parts/account-actions.container';
import {
  LedgerAccountSummary,
  LedgerAccountSummarySkeleton,
} from './parts/account-summary';
import { BankDetailsSkeleton } from './parts/bank-details';
import { BankDetailsContainer } from './parts/bank-details.container';
import { RecentTransactionsSkeleton } from './parts/recent-transactions';
import { RecentTransactionsContainer } from './parts/recent-transactions.container';
import { SectionError } from './parts/section-error';
import { SubAccountsSkeleton } from './parts/sub-accounts';
import { SubAccountsContainer } from './parts/sub-accounts.container';
import { TransactionsChartSkeleton } from './parts/transactions-chart';
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

  const accounts_label = t('shared:accounts');
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
      <div className="mx-auto w-full min-w-0 max-w-5xl">
        <AppBody
          breadcrumbs={{
            label: accounts_label,
            link: '/accounts',
            next: account ? { label: account.name } : undefined,
          }}
        >
          <div className="mt-8 flex min-w-0 flex-col md:mt-12">
            {accountQuery.isPending && (
              <>
                <LedgerAccountSummarySkeleton />
                <BankDetailsSkeleton />
                <SubAccountsSkeleton />
                <PageSection>
                  <TransactionsChartSkeleton />
                </PageSection>
                <RecentTransactionsSkeleton />
              </>
            )}
            {accountQuery.isError && <SectionError title={error_title} />}
            {accountQuery.isSuccess && account && (
              <>
                <LedgerAccountSummary
                  account={account}
                  hasSubAccounts={!!subAccounts.data?.length}
                  actions={
                    <AccountActionsContainer
                      key={account.id}
                      account={account}
                    />
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
      </div>
    </>
  );
}
