import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import {
  Archive,
  ArrowLeftRight,
  Ellipsis,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EntityActionsProps } from '../types';

export function EntityActions({
  isCurrent,
  archived,
  pending,
  onEdit,
  onSwitch,
  onArchive,
  onDelete,
}: Readonly<EntityActionsProps>) {
  const { t } = useTranslation('accounting');
  const edit_label = t('details_edit_label');

  const switch_label = t(
    isCurrent
      ? 'legal_entities_current_entity_label'
      : 'legal_entities_switch_label'
  );

  const more_label = t('details_more_actions_label');
  const archive_label = t('details_archive_label');
  const delete_label = t('details_delete_label');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        size="lg"
        disabled={pending || archived}
        onClick={onEdit}
      >
        <Pencil data-icon="inline-start" aria-hidden />
        {edit_label}
      </Button>
      <Button
        size="lg"
        disabled={pending || archived || isCurrent}
        onClick={onSwitch}
      >
        <ArrowLeftRight data-icon="inline-start" aria-hidden />
        {switch_label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={more_label}
            disabled={pending}
          >
            <Ellipsis aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem disabled={archived} onSelect={onArchive}>
              <Archive aria-hidden />
              {archive_label}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 aria-hidden />
              {delete_label}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
