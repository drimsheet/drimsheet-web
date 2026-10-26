import { useSubAccounts } from '@/account/hooks/use-sub-accounts';
import type { AccountOverviewContainerProps } from '../types';
import { AccountOverview } from './account-overview';

export function AccountOverviewContainer({
  account,
}: Readonly<AccountOverviewContainerProps>) {
  const subAccounts = useSubAccounts(account.id);

  return (
    <AccountOverview
      account={account}
      hasSubAccounts={!!subAccounts.data?.length}
    />
  );
}
