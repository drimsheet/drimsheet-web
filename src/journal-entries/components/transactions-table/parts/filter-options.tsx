import { Alert, AlertDescription } from '@/shared/components/alert';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/components/combobox';
import { Field, FieldLabel } from '@/shared/components/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { Skeleton } from '@/shared/components/skeleton';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  IJournalEntryFilterOption,
  JournalEntryFilterOptionsProps,
} from '../types';

export function JournalEntryFilterOptionsSkeleton() {
  const { t } = useTranslation('journal-entries');
  const loading_label = t('transaction_filters_loading_label');

  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <output className="sr-only">{loading_label}</output>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

export function JournalEntryFilterOptions({
  label,
  value,
  options,
  onChange,
  loading,
  error,
  select,
}: Readonly<JournalEntryFilterOptionsProps>) {
  const { t } = useTranslation(['journal-entries', 'shared']);
  const id = useId();

  const handleChange = (option: IJournalEntryFilterOption | null) => {
    onChange(option?.value);
  };

  const handleSelect = (next: string) => {
    onChange(next === 'all' ? undefined : next);
  };

  if (loading) {
    return <JournalEntryFilterOptionsSkeleton />;
  }

  const error_description = t(
    'journal-entries:transaction_filters_error_description'
  );

  const empty_label = t('shared:no_results_found');

  const placeholder = t(
    'journal-entries:transaction_filters_choose_placeholder',
    { field: label }
  );

  const all_label = t('journal-entries:transaction_filters_all_label');

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error_description}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {select ? (
        <Select value={value ?? 'all'} onValueChange={handleSelect}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{all_label}</SelectItem>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <Combobox
          items={options}
          value={options.find((option) => option.value === value) ?? null}
          onValueChange={handleChange}
          itemToStringLabel={(option: IJournalEntryFilterOption) =>
            option.label
          }
          isItemEqualToValue={(
            a: IJournalEntryFilterOption,
            b: IJournalEntryFilterOption
          ) => a.value === b.value}
        >
          <ComboboxInput id={id} placeholder={placeholder} showClear />
          <ComboboxContent>
            <ComboboxEmpty>{empty_label}</ComboboxEmpty>
            <ComboboxList>
              {(option: IJournalEntryFilterOption) => (
                <ComboboxItem key={option.value} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
    </Field>
  );
}
