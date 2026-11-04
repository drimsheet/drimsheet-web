import { mapAccountTypeToIcon } from '@/account/lib/mappers/account-to-icon.mapper';
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
import type { ILedgerAccountDto } from '@/shared/lib/api/Api';
import { Plus, Wallet } from 'lucide-react';
import { createElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AccountComboboxProps, TAccountComboboxItem } from './types';

function AccountIcon({ account }: Readonly<{ account?: ILedgerAccountDto }>) {
  const Icon = account ? mapAccountTypeToIcon(account) : Wallet;

  return createElement(Icon, { className: 'size-4 shrink-0' });
}

export function AccountCombobox({
  label,
  value,
  accounts,
  onChange,
  onAddAccount,
  newAccountLabel,
  error,
  id = 'account-select',
  placeholder,
  emptyMessage,
  disabled = false,
}: Readonly<AccountComboboxProps>) {
  const { t } = useTranslation(['ledger-accounts']);
  const [searchValue, setSearchValue] = useState('');

  const options = useMemo(() => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();

    if (!normalizedSearchValue) {
      return accounts;
    }

    return accounts.filter((account) => {
      return (
        account.name.toLowerCase().includes(normalizedSearchValue) ||
        account.code.toLowerCase().includes(normalizedSearchValue) ||
        account.type.toLowerCase().includes(normalizedSearchValue)
      );
    });
  }, [accounts, searchValue]);

  const selectedAccount = accounts.find((account) => account.id === value);

  const handleInputValueChange = (value: string) => {
    setSearchValue(value);
  };

  const handleValueChange = (account: TAccountComboboxItem | null) => {
    if (account === 'add-account') {
      setSearchValue('');
      onAddAccount?.();

      return;
    }

    onChange(account?.id ?? '');
    setSearchValue('');
  };

  const handleCheckItemValueEquality = (
    account: TAccountComboboxItem | null,
    selectedAccount: TAccountComboboxItem | null
  ) => {
    const isString =
      typeof account === 'string' || typeof selectedAccount === 'string';

    return isString
      ? account === selectedAccount
      : account?.id === selectedAccount?.id;
  };

  const items: TAccountComboboxItem[] = onAddAccount
    ? [...options, 'add-account']
    : options;

  const hasError = Boolean(error?.length);

  const resolved_placeholder =
    placeholder ?? t('ledger-accounts:select_account_placeholder');

  const resolved_empty_message =
    emptyMessage ?? t('ledger-accounts:no_accounts_found');

  const add_account_text =
    newAccountLabel ?? t('ledger-accounts:add_new_account');

  return (
    <Field data-invalid={hasError}>
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <Combobox
        items={items}
        filter={null}
        autoHighlight
        value={selectedAccount ?? null}
        onValueChange={handleValueChange}
        itemToStringLabel={(item: TAccountComboboxItem | null) =>
          item === 'add-account' ? add_account_text : item?.name || ''
        }
        isItemEqualToValue={handleCheckItemValueEquality}
        onInputValueChange={handleInputValueChange}
      >
        <ComboboxInput
          id={id}
          placeholder={resolved_placeholder}
          disabled={disabled}
          showClear
          aria-invalid={hasError}
        >
          <InputGroupAddon>
            <AccountIcon account={selectedAccount} />
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxContent alignOffset={-28} className="w-full">
          <ComboboxEmpty>{resolved_empty_message}</ComboboxEmpty>
          <ComboboxList>
            {options.map((item) => (
              <ComboboxItem key={item.id} value={item} className="z-400">
                <div className="flex min-w-0 items-center gap-2">
                  <AccountIcon account={item} />
                  <span className="truncate">{item.name}</span>
                </div>
              </ComboboxItem>
            ))}
            {onAddAccount && (
              <ComboboxItem value="add-account">
                <Plus />
                {add_account_text}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldError errors={error} />
    </Field>
  );
}
