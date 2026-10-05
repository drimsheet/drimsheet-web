import type { IItemizedFieldValue } from '@/journal-entries/components/itemized-fields/types';
import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Money } from '@/shared/components/money';
import { TruncatedText } from '@/shared/components/truncated-text';
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ItemizedFieldViewRowProps {
  categoryName: string;
  disabled: boolean;
  editDisabled: boolean;
  index: number;
  item: IItemizedFieldValue;
  onDelete: (itemId: string) => void;
  onEdit: (itemId: string) => void;
}

export function ItemizedFieldViewRow({
  categoryName,
  disabled,
  editDisabled,
  index,
  item,
  onDelete,
  onEdit,
}: Readonly<ItemizedFieldViewRowProps>) {
  const { t } = useTranslation<'journal-entries'>('journal-entries');

  const rowNumber = index + 1;
  const interactionDisabled = disabled || editDisabled;

  const item_view_aria_label = t('itemized_item_view_aria_label', {
    rowNumber,
  });

  const item_menu_aria_label = t('itemized_item_menu_aria_label', {
    rowNumber,
  });

  const edit_item_text = t('itemized_edit_item_text');
  const delete_item_text = t('itemized_delete_item_text');

  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/40 p-3">
      <button
        aria-label={item_view_aria_label}
        className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-sm text-left outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:text-foreground disabled:opacity-70"
        disabled={interactionDisabled}
        onClick={() => onEdit(item.id)}
        type="button"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {categoryName}
          </span>
          {item.description && (
            <TruncatedText
              className="block text-xs text-muted-foreground"
              maxLength={45}
              showTooltip
              tabIndex={-1}
              text={item.description}
            />
          )}
        </span>

        <Money
          className="shrink-0 font-semibold text-sm tabular-nums"
          value={item.amount}
        />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={item_menu_aria_label}
            disabled={disabled}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={interactionDisabled}
            onSelect={() => onEdit(item.id)}
          >
            <Pencil />
            {edit_item_text}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onDelete(item.id)}
            variant="destructive"
          >
            <Trash2 />
            {delete_item_text}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
