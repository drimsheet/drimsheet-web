import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/components/combobox';
import { Field, FieldError } from '@/shared/components/field';
import { InputGroupAddon } from '@/shared/components/input-group';
import { Label } from '@/shared/components/label';
import countries from '@/shared/configs/countries.json' with { type: 'json' };
import { GlobeIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CountryComboBoxProps } from './types';

interface ICountry {
  code: string;
  name: string;
  flag: string;
}

export function CountryComboBox({
  label,
  id = 'country-select',
  disabled = false,
  description,
  clearable = false,
  value,
  jurisdictions,
  onChange,
  error,
}: Readonly<CountryComboBoxProps>) {
  const { t } = useTranslation('shared');
  const [search, setSearch] = useState('');

  const mappedCountries = useMemo(() => {
    return jurisdictions.map((c) => {
      const uiCountry = countries.find((uc) => uc.code === c.code);

      return {
        ...c,
        flag: uiCountry?.flag || '🏳️',
      };
    });
  }, [jurisdictions]);

  const options = mappedCountries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = mappedCountries.find(
    (country) => country.code === value
  );

  const placeholder_text = t('country_select_placeholder');
  const empty_text = t('countries_empty_text');
  const hasError = Boolean(error?.some((item) => item?.message));
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <Combobox
        items={options}
        disabled={disabled}
        autoHighlight
        value={selectedCountry ?? null}
        onValueChange={(val: ICountry | null) => onChange(val ? val.code : '')}
        itemToStringLabel={(item: ICountry | null) => item?.name || ''}
        onInputValueChange={setSearch}
      >
        <ComboboxInput
          id={id}
          disabled={disabled}
          showClear={clearable}
          placeholder={placeholder_text}
          aria-invalid={hasError}
          aria-describedby={
            [hasError ? errorId : '', description ? descriptionId : '']
              .filter(Boolean)
              .join(' ') || undefined
          }
        >
          <InputGroupAddon>
            {selectedCountry ? (
              <span className="text-xl leading-none">
                {selectedCountry.flag}
              </span>
            ) : (
              <GlobeIcon />
            )}
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxContent alignOffset={-28} className="w-60">
          <ComboboxEmpty>{empty_text}</ComboboxEmpty>
          <ComboboxList>
            {options.map((item) => (
              <ComboboxItem key={item.code} value={item} className="z-400">
                <span className="mr-2 text-base leading-none">{item.flag}</span>
                {item.name}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {description && <p id={descriptionId}>{description}</p>}
      <FieldError id={errorId} errors={error} />
    </Field>
  );
}
