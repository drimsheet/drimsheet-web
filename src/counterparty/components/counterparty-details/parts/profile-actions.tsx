import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Skeleton } from '@/shared/components/skeleton';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// Private parts import owner contracts relatively, per the component ownership rules.
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import type { CounterpartyProfileActionsProps } from '../types';

export function CounterpartyProfileActions({
  deleteEligibilityChecking = false,
  deletable = false,
  onActionsOpenChange,
  onDelete,
  onEdit,
  editDisabled = false,
}: Readonly<CounterpartyProfileActionsProps>) {
  const { t } = useTranslation('counterparty');
  const edit_label = t('edit_label');
  const delete_label = t('delete_label');
  const actions_label = t('actions_menu_aria_label');
  const unavailable_text = t('no_available_actions_text');
  const checking_text = t('checking_deletion_eligibility_text');

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="outline"
        onClick={onEdit}
        disabled={editDisabled || !onEdit}
      >
        {edit_label}
      </Button>
      {onDelete && (
        <DropdownMenu onOpenChange={onActionsOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={actions_label}>
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              {deleteEligibilityChecking && (
                <DropdownMenuItem disabled aria-label={checking_text}>
                  <output aria-label={checking_text} className="w-full">
                    <Skeleton className="h-5 w-full" />
                  </output>
                </DropdownMenuItem>
              )}
              {!deleteEligibilityChecking && deletable && (
                <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                  <Trash2 aria-hidden="true" />
                  {delete_label}
                </DropdownMenuItem>
              )}
              {!deleteEligibilityChecking && !deletable && (
                <DropdownMenuLabel>{unavailable_text}</DropdownMenuLabel>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
