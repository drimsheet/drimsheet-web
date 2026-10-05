import { bankLocationMapper } from '@/account/lib/mappers/bank-location.mapper';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/components/combobox';
import { CountryComboBox } from '@/shared/components/country-combobox/country-combobox';
import { Field, FieldError } from '@/shared/components/field';
import { Label } from '@/shared/components/label';
import type { IBankDirectoryDto } from '@/shared/lib/api/Api';
import { Building2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface BankSelectionProps {
  bankLocation: string;
  bankName: string;
  bankLocations: Array<{ code: string; name: string }>;
  banks: IBankDirectoryDto[];
  isBanksLoading?: boolean;
  onLocationChange: (location: string) => void;
  onBankNameChange: (bankName: string) => void;
  locationError?: Array<{ message?: string } | undefined>;
  bankNameError?: Array<{ message?: string } | undefined>;
  disabled?: boolean;
}

type BankItem = IBankDirectoryDto & {
  name?: string;
  code?: string;
  id?: string;
};

export function BankSelection({
  bankLocation,
  bankName,
  bankLocations,
  banks,
  isBanksLoading = false,
  onLocationChange,
  onBankNameChange,
  locationError,
  bankNameError,
  disabled = false,
}: Readonly<BankSelectionProps>) {
  const { t } = useTranslation<'ledger-accounts'>('ledger-accounts');
  const [searchQuery, setSearchQuery] = useState('');

  const safeBanks = useMemo(() => (Array.isArray(banks) ? banks : []), [banks]);

  const jurisdictions = useMemo(
    () => bankLocations.map(bankLocationMapper.toJurisdictionDto),
    [bankLocations]
  );

  const getBankDisplayName = (bank: BankItem) =>
    bank.bankName ?? bank.name ?? '';

  const getBankCode = (bank: BankItem) =>
    bank.bankCode ?? bank.code ?? bank.id ?? '';

  const filteredBanks = useMemo(() => {
    if (!searchQuery) {
      return safeBanks;
    }

    return safeBanks.filter((bank) =>
      getBankDisplayName(bank).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [safeBanks, searchQuery]);

  const selectedBank = safeBanks.find(
    (b) =>
      getBankDisplayName(b).toLowerCase() === (bankName ?? '').toLowerCase() ||
      getBankCode(b) === bankName
  );

  const bank_location_label = t('bank_location_label');
  const bank_name_label = t('bank_name_label');
  const select_bank_name_placeholder = t('select_bank_name_placeholder');
  const no_banks_found = t('no_banks_found');
  const loading_banks = t('loading_banks');

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr_3fr]">
      <CountryComboBox
        error={locationError}
        jurisdictions={jurisdictions}
        label={bank_location_label}
        onChange={(val) => {
          onLocationChange(val);
          onBankNameChange('');
        }}
        value={bankLocation}
      />

      <Field data-invalid={Boolean(bankNameError?.length)}>
        <Label htmlFor="bankName">{bank_name_label}</Label>
        <Combobox
          items={filteredBanks}
          autoHighlight
          disabled={disabled || !bankLocation || isBanksLoading}
          value={
            selectedBank ??
            (bankName
              ? ({
                  countryCode: bankLocation,
                  bankCode: bankName,
                  bankName,
                } as BankItem)
              : null)
          }
          onValueChange={(val: BankItem | null) =>
            onBankNameChange(val ? getBankDisplayName(val) : '')
          }
          itemToStringLabel={(item: BankItem | null) =>
            item ? getBankDisplayName(item) : ''
          }
          onInputValueChange={(val) => {
            setSearchQuery(val);
          }}
        >
          <ComboboxInput
            id="bankName"
            aria-label={bank_name_label}
            placeholder={
              isBanksLoading ? loading_banks : select_bank_name_placeholder
            }
          />
          <ComboboxContent className="w-full">
            <ComboboxEmpty>{no_banks_found}</ComboboxEmpty>
            <ComboboxList>
              {filteredBanks.map((item, index) => (
                <ComboboxItem
                  key={getBankCode(item) || `${index}`}
                  value={item}
                >
                  <Building2 className="mr-2 size-4 text-muted-foreground" />
                  {getBankDisplayName(item)}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldError errors={bankNameError} />
      </Field>
    </div>
  );
}
