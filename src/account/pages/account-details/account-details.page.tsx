import { useLedgerAccount } from '@/account/hooks/use-ledger-account';
import { useSubAccounts } from '@/account/hooks/use-sub-accounts';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { cn } from '@/shared/lib/utils/cn';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { AccountActionsSkeleton } from './parts/account-actions';
import { AccountActionsContainer } from './parts/account-actions.container';
import { AccountHeader, AccountHeaderSkeleton } from './parts/account-header';
import {
  LedgerAccountSummary,
  LedgerAccountSummarySkeleton,
} from './parts/account-summary';
import { BankDetailsSkeleton } from './parts/bank-details';
import { BankDetailsContainer } from './parts/bank-details.container';
import { CashFlowPeriodSkeleton } from './parts/cash-flow-period';
import { RecentTransactionsSkeleton } from './parts/recent-transactions';
import { RecentTransactionsContainer } from './parts/recent-transactions.container';
import { SectionError } from './parts/section-error';
import { SubAccountsSkeleton } from './parts/sub-accounts';
import { SubAccountsContainer } from './parts/sub-accounts.container';
import { TransactionsChartSkeleton } from './parts/transactions-chart';
import { TransactionsChartRangeSkeleton } from './parts/transactions-chart-range';
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

  const showBankDetails =
    accountQuery.isPending || account?.behavior === 'bank';

  const overview_title = t('ledger-accounts:details_overview_title');
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
    <AppBody
      breadcrumbs={{
        label: accounts_label,
        link: '/accounts',
        next: account ? { label: account.name } : undefined,
      }}
    >
      <div className="mt-8 flex min-w-0 flex-col gap-8 md:mt-12 md:gap-12">
        {accountQuery.isError && <SectionError title={error_title} />}
        {(accountQuery.isPending || accountQuery.isSuccess) && (
          <AppSection title={overview_title} className="@container gap-6 py-0">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1 basis-full @xl:basis-0">
                {accountQuery.isPending && <AccountHeaderSkeleton />}
                {accountQuery.isSuccess && account && (
                  <AccountHeader account={account} />
                )}
              </div>
              {accountQuery.isPending && <AccountActionsSkeleton />}
              {accountQuery.isSuccess && account && (
                <AccountActionsContainer key={account.id} account={account} />
              )}
            </div>
            <div className="mt-2 flex min-w-0 flex-col gap-8">
              <div
                className={cn(
                  'grid min-w-0 gap-8',
                  showBankDetails &&
                    '@2xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.55fr)]'
                )}
              >
                {accountQuery.isPending && <LedgerAccountSummarySkeleton />}
                {accountQuery.isSuccess && account && (
                  <LedgerAccountSummary
                    account={account}
                    hasSubAccounts={!!subAccounts.data?.length}
                  />
                )}
                {showBankDetails && (
                  <div className="min-w-0 @2xl:border-l @2xl:pl-8">
                    {accountQuery.isPending && <BankDetailsSkeleton />}
                    {accountQuery.isSuccess && account && (
                      <BankDetailsContainer
                        key={`bank-${account.id}`}
                        accountId={account.id}
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-8">
                {accountQuery.isPending && <SubAccountsSkeleton />}
                {accountQuery.isSuccess && account && (
                  <SubAccountsContainer
                    key={`children-${account.id}`}
                    accountId={account.id}
                  />
                )}
                {accountQuery.isPending && (
                  <div className="flex min-w-0 flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <TransactionsChartRangeSkeleton />
                      <CashFlowPeriodSkeleton />
                    </div>
                    <TransactionsChartSkeleton />
                  </div>
                )}
                {accountQuery.isSuccess && canShowCashFlow && (
                  <TransactionsChartContainer
                    key={`chart-${account.id}`}
                    accountId={account.id}
                  />
                )}
              </div>
            </div>
          </AppSection>
        )}
        {accountQuery.isPending && <RecentTransactionsSkeleton />}
        {accountQuery.isSuccess && account && (
          <RecentTransactionsContainer
            key={`transactions-${account.id}`}
            accountId={account.id}
          />
        )}
      </div>
    </AppBody>
  );
}
