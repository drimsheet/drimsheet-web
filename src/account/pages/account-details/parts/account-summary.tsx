import { Money } from '@/shared/components/money';
import { StatusBadge } from '@/shared/components/status-badge';
import { cn } from '@/shared/lib/utils/cn';
import { useTranslation } from 'react-i18next';

import type { LedgerAccountSummaryProps } from '../types';
import { AccountBehaviorLabel } from './account-behavior-label';

export function LedgerAccountSummary({
  account,
  hasSubAccounts = false,
  className,
  ...props
}: Readonly<LedgerAccountSummaryProps>) {
  const { t, i18n } = useTranslation(['ledger-accounts', 'shared']);

  const shouldShowFunctionalBalance =
    account.balance.currencyCode.toLowerCase() !==
    account.functionalBalance.currencyCode.toLowerCase();

  const dateLocale =
    i18n.resolvedLanguage === 'en' ? 'en-GB' : i18n.resolvedLanguage;

  const createdDate = new Intl.DateTimeFormat(dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(account.createdAt));

  const status_label = t(`shared:${account.status}`);

  const created_text = t('ledger-accounts:account_summary_created_text', {
    date: createdDate,
  });

  const balance_label = t('ledger-accounts:account_summary_balance_label');

  const excludes_children_text = t(
    'ledger-accounts:details_excludes_children_text'
  );

  const functional_balance_label = t(
    'ledger-accounts:account_summary_functional_balance_label'
  );

  return (
    <div className={cn('flex min-w-0 flex-col gap-7', className)} {...props}>
      <div className="flex min-w-0 flex-col gap-4">
        <AccountBehaviorLabel behavior={account.behavior} />
        <h1 className="m-0 font-heading text-2xl/none font-medium tracking-tight wrap-anywhere sm:text-3xl/none">
          {account.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <StatusBadge
            variant="neutral"
            label={status_label}
            className="rounded-sm border-0"
          />
          <time
            dateTime={account.createdAt}
            className="text-sm text-muted-foreground"
          >
            {created_text}
          </time>
        </div>
      </div>

      <dl className="flex min-w-0 flex-col gap-3">
        <dt className="text-sm">{balance_label}</dt>
        <dd className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-2">
          <Money
            value={account.balance}
            localCode={account.functionalBalance.currencyCode}
            className="font-heading text-4xl font-medium tracking-tight tabular-nums wrap-anywhere sm:text-5xl"
          />
          {shouldShowFunctionalBalance && (
            <span className="flex min-w-0 items-baseline gap-1 text-sm text-muted-foreground tabular-nums">
              <span className="sr-only">{functional_balance_label}</span>
              <span aria-hidden="true">≈</span>
              <Money
                value={account.functionalBalance}
                className="min-w-0 wrap-anywhere"
              />
            </span>
          )}
        </dd>
        {hasSubAccounts && (
          <dd className="text-sm text-muted-foreground">
            {excludes_children_text}
          </dd>
        )}
      </dl>
    </div>
  );
}
