import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import type { LedgerAccountSummaryProps } from '../types';

export function LedgerAccountSummary({
  account,
  hasSubAccounts = false,
}: Readonly<LedgerAccountSummaryProps>) {
  const { t } = useTranslation('ledger-accounts');

  const shouldShowFunctionalBalance =
    account.balance.currencyCode.toLowerCase() !==
    account.functionalBalance.currencyCode.toLowerCase();

  const balance_label = t('account_summary_balance_label');

  const excludes_children_text = t('details_excludes_children_text');

  const functional_balance_label = t(
    'account_summary_functional_balance_label'
  );

  return (
    <dl className="flex min-w-0 flex-col gap-2">
      <dt className="text-sm text-muted-foreground">{balance_label}</dt>
      <dd>
        <Money
          value={account.balance}
          className="font-heading text-4xl font-medium tracking-tight tabular-nums wrap-anywhere"
        />
      </dd>
      {shouldShowFunctionalBalance && (
        <dd className="flex min-w-0 items-baseline gap-1 text-sm text-muted-foreground tabular-nums">
          <span className="sr-only">{functional_balance_label}</span>
          <Money
            value={account.functionalBalance}
            isConverted
            className="min-w-0 wrap-anywhere"
          />
        </dd>
      )}
      {hasSubAccounts && (
        <dd className="text-sm text-muted-foreground">
          {excludes_children_text}
        </dd>
      )}
    </dl>
  );
}

export function LedgerAccountSummarySkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_account_summary');

  return (
    <div aria-busy="true" className="flex min-w-0 flex-col gap-2">
      <output className="sr-only" aria-label={loading_label}>
        {loading_label}
      </output>
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-10 w-56 max-w-full" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}
