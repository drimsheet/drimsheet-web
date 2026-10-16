import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Archive, MoreHorizontal, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CategoryActionsProps } from '../types';

export function CategoryActions({
  onEdit,
  editDisabled = false,
}: Readonly<CategoryActionsProps>) {
  const { t } = useTranslation('ledger-accounts');

  const edit_label = t('details_edit_label');
  const archive_label = t('details_archive_label');
  const delete_label = t('details_delete_label');
  const actions_aria_label = t('category_details_actions_aria_label');

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button variant="outline" onClick={onEdit} disabled={editDisabled}>
        {edit_label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={actions_aria_label}>
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Archive aria-hidden="true" />
              {archive_label}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash2 aria-hidden="true" />
              {delete_label}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
