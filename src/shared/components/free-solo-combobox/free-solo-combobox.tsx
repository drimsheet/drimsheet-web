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
import { useMemo } from 'react';
import type { FreeSoloComboboxProps } from './types';

export function FreeSoloCombobox<TOption extends object>({
  disabled = false,
  emptyMessage,
  error,
  getOptionLabel,
  id,
  isOptionEqualToValue,
  label,
  name,
  onBlur,
  onValueChange,
  options,
  placeholder,
  required = false,
  value,
}: Readonly<FreeSoloComboboxProps<TOption>>) {
  let inputValue = '';

  if (typeof value === 'string') {
    inputValue = value;
  } else if (value !== null) {
    inputValue = getOptionLabel(value);
  }

  const selectedOption = typeof value === 'object' ? value : null;

  const filteredOptions = useMemo(() => {
    const normalizedInputValue = inputValue.trim().toLowerCase();

    if (!normalizedInputValue) return options;

    return options.filter((option) =>
      getOptionLabel(option).toLowerCase().includes(normalizedInputValue)
    );
  }, [getOptionLabel, inputValue, options]);

  const hasError = Boolean(error?.length);
  const errorId = `${id}-error`;

  const handleInputValueChange = (
    nextInputValue: string,
    eventDetails: { reason: string }
  ) => {
    const shouldIgnoreInputValueChange =
      eventDetails.reason === 'item-press' ||
      eventDetails.reason === 'input-clear' ||
      eventDetails.reason === 'none';

    if (shouldIgnoreInputValueChange) {
      return;
    }

    onValueChange(nextInputValue === '' ? null : nextInputValue);
  };

  const handleOptionValueChange = (nextValue: TOption | null) => {
    onValueChange(nextValue);
  };

  return (
    <Field data-invalid={hasError}>
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <Combobox
        items={filteredOptions}
        filter={null}
        autoHighlight
        disabled={disabled}
        inputValue={inputValue}
        isItemEqualToValue={isOptionEqualToValue}
        itemToStringLabel={getOptionLabel}
        name={name}
        value={selectedOption}
        onInputValueChange={handleInputValueChange}
        onValueChange={handleOptionValueChange}
      >
        <ComboboxInput
          id={id}
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError}
          aria-required={required}
          disabled={disabled}
          onBlur={onBlur}
          placeholder={placeholder}
          showClear
        />
        <ComboboxContent className="w-full">
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {filteredOptions.map((option, index) => {
              const optionLabel = getOptionLabel(option);

              return (
                <ComboboxItem key={`${optionLabel}-${index}`} value={option}>
                  <span className="min-w-0 truncate">{optionLabel}</span>
                </ComboboxItem>
              );
            })}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldError id={errorId} errors={error} />
    </Field>
  );
}
