import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemSkeleton,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Archive, Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CategoryRowActionsProps } from '../types';

export function CategoryRowActions({
  account,
  onViewAccount,
  onEditAccount,
  onArchiveAccount,
  checking,
  eligibilityFailed,
  canDelete,
  deleting,
  onOpenChange,
  onDelete,
}: Readonly<CategoryRowActionsProps>) {
  const { t } = useTranslation('ledger-accounts');
  const isCategory = account.type === 'revenue' || account.type === 'expense';
  const canManage = isCategory && account.status !== 'archived';

  const row_actions_label = t('categories_row_actions_label', {
    name: account.accountName,
  });

  const edit_label = t('categories_edit_label');
  const archive_label = t('categories_archive_label');
  const delete_label = t('details_delete_label');
  const checking_label = t('checking_deletion_eligibility_text');
  const eligibility_error_text = t('deletion_eligibility_error_text');
  const view_transactions_label = t('categories_view_transactions_label');

  return (
    <DropdownMenu modal={false} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={row_actions_label}>
          <Ellipsis aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {!isCategory && (
            <DropdownMenuItem onSelect={() => onViewAccount(account.accountId)}>
              {view_transactions_label}
            </DropdownMenuItem>
          )}
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
          {checking && <DropdownMenuItemSkeleton aria-label={checking_label} />}
          {!checking && eligibilityFailed && (
            <DropdownMenuLabel className="whitespace-normal">
              {eligibility_error_text}
            </DropdownMenuLabel>
          )}
          {!checking && !eligibilityFailed && canDelete && (
            <DropdownMenuItem
              variant="destructive"
              disabled={deleting}
              onSelect={onDelete}
            >
              <Trash2 aria-hidden />
              {delete_label}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
