import { Button } from '@/shared/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/card';
import { Money } from '@/shared/components/money';
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
    <Card
      role="region"
      aria-label={title}
      className="min-w-0 rounded-none bg-muted shadow-none ring-0"
    >
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle role="heading" aria-level={2}>
          {title}
        </CardTitle>
        <span className="text-sm text-muted-foreground">{balances_label}</span>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
