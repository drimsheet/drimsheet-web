import { Button } from '@/shared/components/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/empty';
import { Landmark, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AccountPageEmptyStateProps } from '../types';

export function AccountPageEmptyState({
  onAddAccount,
}: Readonly<AccountPageEmptyStateProps>) {
  const { t } = useTranslation('ledger-accounts');
  const title = t('dashboard_empty_title');
  const description = t('dashboard_empty_description');
  const add_label = t('dashboard_add_first_label');

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Landmark aria-hidden />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <Button onClick={onAddAccount}>
        <Plus data-icon="inline-start" />
        {add_label}
      </Button>
    </Empty>
  );
}
