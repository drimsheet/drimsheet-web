import { Button } from '@/shared/components/button';
import { Money } from '@/shared/components/money';
import { PageSection } from '@/shared/components/page-section';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import type { SubAccountsProps } from '../types';

export function SubAccounts({
  accounts,
  onOpenAccount,
}: Readonly<SubAccountsProps>) {
  const { t } = useTranslation(['ledger-accounts', 'shared']);

  if (accounts.length === 0) return null;

  const title = t('ledger-accounts:details_sub_accounts_title', {
    count: accounts.length,
  });

  const balances_label = t('ledger-accounts:details_current_balances_label');

  return (
    <PageSection
      title={title}
      role="region"
      aria-label={title}
      className="min-w-0 rounded-none bg-muted px-6 shadow-none ring-0"
    >
      <span className="text-sm text-muted-foreground">{balances_label}</span>

      <div>
        <ul className="flex flex-col gap-4">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                <Button
                  variant="link"
                  className="h-auto max-w-full p-0 whitespace-normal text-left"
                  onClick={() => onOpenAccount(account.id)}
                >
                  {account.name}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {t(`shared:${account.status}`)}
                </span>
              </div>
              <Money value={account.balance} className="text-sm tabular-nums" />
            </li>
          ))}
        </ul>
      </div>
    </PageSection>
  );
}

export function SubAccountsSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_sub_accounts');

  return (
    <PageSection
      aria-busy="true"
      className="min-w-0 rounded-none bg-muted px-6 shadow-none ring-0"
    >
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-48 max-w-full" />
        {[0, 1].map((row) => (
          <div
            key={row}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2"
          >
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </PageSection>
  );
}
