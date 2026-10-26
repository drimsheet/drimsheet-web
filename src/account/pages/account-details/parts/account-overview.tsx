import { AccountCashFlowChartSkeleton } from '@/reporting/components/account-cash-flow-chart';
import { cn } from '@/shared/lib/utils/cn';
import { useTranslation } from 'react-i18next';
import type { AccountOverviewProps } from '../types';
import { AccountActionsSkeleton } from './account-actions';
import { AccountActionsContainer } from './account-actions.container';
import { AccountCashFlowChartRangeSkeleton } from './account-cash-flow-chart-range';
import { AccountCashFlowChartContainer } from './account-cash-flow-chart.container';
import { AccountHeader, AccountHeaderSkeleton } from './account-header';
import {
  LedgerAccountSummary,
  LedgerAccountSummarySkeleton,
} from './account-summary';
import { BankDetailsSkeleton } from './bank-details';
import { BankDetailsContainer } from './bank-details.container';
import { CashFlowPeriodSkeleton } from './cash-flow-period';
import { SubAccountsSkeleton } from './sub-accounts';
import { SubAccountsContainer } from './sub-accounts.container';

export function AccountOverview({
  account,
  hasSubAccounts,
}: Readonly<AccountOverviewProps>) {
  const showBankDetails = account.behavior === 'bank';

  const canShowCashFlow =
    !account.isControlAccount &&
    (account.behavior === 'bank' || account.behavior === 'petty_cash');

  return (
    <div className="@container flex min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 basis-full @xl:basis-0">
          <AccountHeader account={account} />
        </div>
        <AccountActionsContainer key={account.id} account={account} />
      </div>
      <div className="mt-2 flex min-w-0 flex-col gap-8">
        <div
          className={cn(
            'grid min-w-0 gap-8',
            showBankDetails &&
              '@2xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.55fr)]'
          )}
        >
          <LedgerAccountSummary
            account={account}
            hasSubAccounts={hasSubAccounts}
          />
          {showBankDetails && (
            <div className="min-w-0 @2xl:border-l @2xl:pl-8">
              <BankDetailsContainer
                key={`bank-${account.id}`}
                accountId={account.id}
              />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-8">
          <SubAccountsContainer
            key={`children-${account.id}`}
            accountId={account.id}
          />
          {canShowCashFlow && (
            <AccountCashFlowChartContainer
              key={`chart-${account.id}`}
              accountId={account.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function AccountOverviewSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_transactions_chart');

  return (
    <div className="@container flex min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 basis-full @xl:basis-0">
          <AccountHeaderSkeleton />
        </div>
        <AccountActionsSkeleton />
      </div>
      <div className="mt-2 flex min-w-0 flex-col gap-8">
        <div className="grid min-w-0 gap-8 @2xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.55fr)]">
          <LedgerAccountSummarySkeleton />
          <div className="min-w-0 @2xl:border-l @2xl:pl-8">
            <BankDetailsSkeleton />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-8">
          <SubAccountsSkeleton />
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <AccountCashFlowChartRangeSkeleton />
              <CashFlowPeriodSkeleton />
            </div>
            <AccountCashFlowChartSkeleton aria-label={loading_label} />
          </div>
        </div>
      </div>
    </div>
  );
}
