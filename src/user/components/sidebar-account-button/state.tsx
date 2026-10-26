import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function SidebarAccountButtonSkeleton() {
  const { t } = useTranslation('user');
  const loading_label = t('account_management_loading_status');

  return (
    <div
      aria-busy="true"
      className="flex min-h-12 w-full items-center gap-2 rounded-md p-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:min-h-8 group-data-[collapsible=icon]:p-0"
    >
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <Skeleton className="size-8 shrink-0 rounded-md" />
      <div className="flex min-w-0 flex-1 flex-col gap-1 group-data-[collapsible=icon]:hidden">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="size-4 shrink-0 group-data-[collapsible=icon]:hidden" />
    </div>
  );
}
