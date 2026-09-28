import { AccountOverview } from '@/account/components/account-overview';
import { useLedgerAccount } from '@/account/hooks/use-ledger-account';
import { AppBody, AppHeader } from '@/shared/components/app';
import {
  type IPageBreadcrumb,
  PageBreadcrumbs,
} from '@/shared/components/page-breadcrumbs';
import { useNavigate, useParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

export function AccountPage() {
  const { t } = useTranslation(['shared']);
  const { accountId } = useParams();
  const navigate = useNavigate();

  const { data: account, isLoading: isLoadingAccount } =
    useLedgerAccount(accountId);

  const accountsLabel = t('shared:accounts');
  const new_transaction_label = t('shared:new_transaction');

  const accountName = account?.name ?? '';

  const breadcrumb: IPageBreadcrumb = {
    label: accountsLabel,
    link: '/accounts',
    next: {
      label: accountName,
      link: '#',
    },
  };

  return (
    <div>
      <AppHeader>
        <PageBreadcrumbs breadcrumb={breadcrumb} isLoading={isLoadingAccount} />
      </AppHeader>

      <AppBody>
        <div className="flex flex-col gap-10">
          {account && (
            <AccountOverview
              account={account}
              hideIcon
              actionButtonText={new_transaction_label}
              onActionButtonClick={() => navigate('/transactions')}
            />
          )}
        </div>
      </AppBody>
    </div>
  );
}
