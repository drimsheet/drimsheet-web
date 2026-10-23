import { Button } from '@/shared/components/button';
import { Checkbox } from '@/shared/components/checkbox';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/popover';
import { Separator } from '@/shared/components/separator';
import { cn } from '@/shared/lib/utils/cn';
import { ListFilter } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TableFilterProps } from './types';

export function TableFilter({
  title,
  multiple = true,
  options,
  selectedValues,
  onApply,
  trigger,
  disabled,
}: Readonly<TableFilterProps>) {
  const { t } = useTranslation('shared');
  const id = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<(string | number)[]>([]);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  );

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft([...selectedValues]);
      setSearch('');
    }

    setOpen(next);
  };

  const handleToggle = (value: string | number) => {
    if (!multiple) {
      setDraft((current) => (current.includes(value) ? [] : [value]));

      return;
    }

    setDraft((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleClear = () => {
    onApply([]);
    setOpen(false);
  };

  const filter_label = title ? t('filter_by', { title }) : t('filter');

  const trigger_label = selectedValues.length
    ? t('table_filter_active_label', {
        label: filter_label,
        count: selectedValues.length,
      })
    : filter_label;

  const clear_label = t('clear');
  const apply_label = t('table_filter_apply_action');
  const search_label = t('table_filter_search_label');
  const no_results_text = t('no_results_found');

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={disabled}
            aria-label={trigger_label}
            className={cn(
              'h-8 shrink-0 px-1.5 text-muted-foreground pointer-coarse:min-h-11 pointer-coarse:min-w-11',
              selectedValues.length > 0 &&
                'bg-selection text-selection-foreground hover:bg-selection-hover'
            )}
            data-testid="table-filter-trigger"
          >
            <ListFilter className="size-3.5" aria-hidden />
            {selectedValues.length > 0 && (
              <span className="text-[11px] font-medium tabular-nums">
                {selectedValues.length}
              </span>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="w-64 max-w-[calc(100vw-2rem)] gap-3 border border-input shadow-none ring-0"
        aria-labelledby={`${id}-title`}
      >
        <fieldset className="flex min-w-0 flex-col gap-3" disabled={disabled}>
          <legend id={`${id}-title`} className="mb-3 text-sm font-medium">
            {filter_label}
          </legend>
          {options.length > 5 && (
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label={search_label}
              placeholder={search_label}
            />
          )}
          <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            {filteredOptions.map((option) => (
              <Label
                key={`${typeof option.value}-${option.value}`}
                className="min-h-9 gap-3 rounded-sm px-1 text-sm font-normal hover:bg-accent pointer-coarse:min-h-11"
              >
                <Checkbox
                  checked={draft.includes(option.value)}
                  onCheckedChange={() => handleToggle(option.value)}
                />
                {option.label}
              </Label>
            ))}
            {!filteredOptions.length && (
              <p className="py-3 text-sm text-muted-foreground">
                {no_results_text}
              </p>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              {clear_label}
            </Button>
            <Button type="button" size="sm" onClick={handleApply}>
              {apply_label}
            </Button>
          </div>
        </fieldset>
      </PopoverContent>
    </Popover>
  );
}
