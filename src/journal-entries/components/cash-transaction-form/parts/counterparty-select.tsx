import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/components/combobox';
import { Field, FieldError } from '@/shared/components/field';
import { Label } from '@/shared/components/label';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type {
  CounterpartySelectProps,
  UCounterpartySelectItem,
} from '../types';

export function CounterpartySelect({
  value,
  options,
  onChange,
  onCreate,
  onBlur,
  creationDisabled = false,
  disabled = false,
  error,
  label,
  placeholder,
  emptyMessage,
  createLabel,
}: Readonly<CounterpartySelectProps>) {
  const [searchValue, setSearchValue] = useState<string | null>(null);

  // TODO(ENG-250): Add infinite loading to this combobox list to reach all counterparty pages.
  // https://drimsheet-app.atlassian.net/jira/browse/ENG-250
  const normalizedSearch = (searchValue ?? '').trim().toLowerCase();

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(normalizedSearch)
  );

  const items: UCounterpartySelectItem[] = onCreate
    ? [...filteredOptions, 'create-counterparty']
    : filteredOptions;

  const hasError = Boolean(error?.length);
  const id = 'cash-transaction-counterparty';
  const errorId = `${id}-error`;

  const handleInputValueChange = (
    input: string,
    details: { reason: string }
  ) => {
    if (details.reason !== 'input-change') {
      return;
    }

    setSearchValue(input);

    if (value.id) {
      onChange(null);
    }
  };

  const handleValueChange = (item: UCounterpartySelectItem | null) => {
    if (item === 'create-counterparty') {
      onCreate?.((searchValue ?? '').trim());

      return;
    }

    setSearchValue(null);
    onChange(item);
  };

  const handleItemEquality = (
    item: UCounterpartySelectItem,
    selected: UCounterpartySelectItem
  ) => {
    if (typeof item === 'string' || typeof selected === 'string') {
      return item === selected;
    }

    return item.id === selected.id;
  };

  return (
    <Field data-invalid={hasError}>
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <Combobox
        items={items}
        filter={null}
        autoHighlight
        disabled={disabled}
        inputValue={searchValue ?? value.name}
        value={value.id ? value : null}
        isItemEqualToValue={handleItemEquality}
        itemToStringLabel={(item: UCounterpartySelectItem) =>
          item === 'create-counterparty' ? createLabel : item.name
        }
        onInputValueChange={handleInputValueChange}
        onValueChange={handleValueChange}
      >
        <ComboboxInput
          id={id}
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError}
          aria-required
          disabled={disabled}
          onBlur={onBlur}
          placeholder={placeholder}
          showClear
        />
        <ComboboxContent className="w-full">
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {filteredOptions.map((option) => (
              <ComboboxItem key={option.id} value={option}>
                <span className="min-w-0 truncate">{option.name}</span>
              </ComboboxItem>
            ))}
            {onCreate && (
              <ComboboxItem
                value="create-counterparty"
                disabled={creationDisabled}
              >
                <Plus />
                {createLabel}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldError id={errorId} errors={error} />
    </Field>
  );
}
