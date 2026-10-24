import { PageTitle } from '@/shared/components/page-title';
import { Skeleton } from '@/shared/components/skeleton';
import { StatusBadge } from '@/shared/components/status-badge';
import { useTranslation } from 'react-i18next';
import type { AccountHeaderProps } from '../types';

export function AccountHeader({ account }: Readonly<AccountHeaderProps>) {
  const { t } = useTranslation('shared');
  const status_label = t(account.status);

  return (
    <div className="min-w-0 text-[28px] leading-tight">
      <PageTitle className="inline wrap-anywhere">{account.name}</PageTitle>
      <StatusBadge
        className="ml-2 align-super"
        variant={account.status === 'active' ? 'success' : 'neutral'}
        label={status_label}
      />
    </div>
  );
}

export function AccountHeaderSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_account_header');

  return (
    <div aria-busy="true" className="flex min-w-0 items-start gap-2">
      <output className="sr-only" aria-label={loading_label}>
        {loading_label}
      </output>
      <Skeleton className="h-9 min-w-0 flex-1 max-w-80" />
      <Skeleton className="h-5 w-12 shrink-0" />
    </div>
  );
}
