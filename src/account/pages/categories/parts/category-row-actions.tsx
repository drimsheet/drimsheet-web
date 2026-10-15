import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Archive, Ellipsis, List, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CategoryRowActionsProps } from '../types';

export function CategoryRowActions({
  account,
  onViewAccount,
  onEditAccount,
  onArchiveAccount,
}: Readonly<CategoryRowActionsProps>) {
  const { t } = useTranslation('ledger-accounts');
  const isCategory = account.type === 'revenue' || account.type === 'expense';
  const canManage = isCategory && account.status !== 'archived';

  const row_actions_label = t('categories_row_actions_label', {
    name: account.accountName,
  });

  const view_label = t(
    isCategory
      ? 'category_details_view_label'
      : 'categories_view_transactions_label'
  );

  const edit_label = t('categories_edit_label');
  const archive_label = t('categories_archive_label');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={row_actions_label}>
          <Ellipsis aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => onViewAccount(account.accountId)}>
            <List aria-hidden />
            {view_label}
          </DropdownMenuItem>
          {canManage && (
            <>
              <DropdownMenuItem onSelect={() => onEditAccount(account)}>
                <Pencil aria-hidden />
                {edit_label}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onArchiveAccount(account)}>
                <Archive aria-hidden />
                {archive_label}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
