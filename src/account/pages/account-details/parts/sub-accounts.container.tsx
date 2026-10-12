import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSubAccounts } from '../hooks/use-account-details';
import type { AccountSectionProps } from '../types';
import { SectionError } from './section-error';
import { SubAccounts } from './sub-accounts';
import { SubAccountsSkeleton } from './sub-accounts-skeleton';

export function SubAccountsContainer({
  accountId,
}: Readonly<AccountSectionProps>) {
  const { t } = useTranslation('ledger-accounts');
  const navigate = useNavigate();
  const accounts = useSubAccounts(accountId);
  const title = t('details_sub_accounts_error_title');

  if (accounts.isPending) return <SubAccountsSkeleton />;

  if (accounts.isError)
    return (
      <SectionError title={title} onRetry={() => void accounts.refetch()} />
    );

  return (
    <SubAccounts
      accounts={accounts.data}
      onOpenAccount={(id) => navigate(`/accounts/${id}`)}
    />
  );
}
