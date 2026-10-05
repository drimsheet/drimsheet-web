import { Button } from '@/shared/components/button';
import { RadioGroup, RadioGroupItem } from '@/shared/components/radio-group';
import {
  ELedgerAccountBehavior,
  type ULedgerAccountBehavior,
} from '@/shared/lib/api/Api';
import { cn } from '@/shared/lib/utils/cn';
import { CreditCard, Landmark, PiggyBank, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccountTypeSelectionProps, IAccountTypeOption } from './types';

export function AccountTypeSelection({
  defaultValue,
  value,
  onSubmit,
  disabled = false,
  className,
}: Readonly<AccountTypeSelectionProps>) {
  const { t } = useTranslation(['ledger-accounts']);

  const [internalSelected, setInternalSelected] = useState(
    value ?? defaultValue
  );

  const selectedValue = value !== undefined ? value : internalSelected;

  const options: IAccountTypeOption[] = [
    {
      value: ELedgerAccountBehavior.Bank,
      label: t('ledger-accounts:bank_account_label'),
      description: t('ledger-accounts:select_account_type_bank_description'),
      icon: <Landmark className="h-6 w-6 text-muted-foreground" />,
    },
    {
      value: ELedgerAccountBehavior.PettyCash,
      label: t('ledger-accounts:petty_cash_label'),
      description: t(
        'ledger-accounts:select_account_type_petty_cash_description'
      ),
      icon: <PiggyBank className="h-6 w-6 text-muted-foreground" />,
    },
    {
      value: ELedgerAccountBehavior.DefaultCash,
      label: t('ledger-accounts:virtual_account_label'),
      description: t(
        'ledger-accounts:select_account_type_virtual_account_description'
      ),
      icon: <Wallet className="h-6 w-6 text-muted-foreground" />,
    },
    {
      value: ELedgerAccountBehavior.CreditCard,
      label: t('ledger-accounts:credit_card_label'),
      description: t(
        'ledger-accounts:select_account_type_credit_card_description'
      ),
      icon: <CreditCard className="h-6 w-6 text-muted-foreground" />,
    },
  ];

  const canSubmit = Boolean(selectedValue && !disabled);

  const handleSelect = (optionValue: ULedgerAccountBehavior) => {
    if (disabled) return;

    if (value === undefined) {
      setInternalSelected(optionValue);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit || !selectedValue) return;

    onSubmit?.(selectedValue);
  };

  const title = t('ledger-accounts:select_account_type_title');
  const continueText = t('ledger-accounts:continue');

  return (
    <div className={cn('flex w-full max-w-lg flex-col gap-6 p-2', className)}>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>

      <RadioGroup
        value={selectedValue ?? ''}
        defaultValue={defaultValue ?? ''}
        onValueChange={(val) => handleSelect(val as ULedgerAccountBehavior)}
        aria-label={title}
        disabled={disabled}
        className="flex flex-col gap-3"
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          const optionId = `account-type-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                'flex cursor-pointer items-center gap-4 rounded-lg border border-border p-3 outline-none transition-all',
                'hover:bg-accent/50 focus-within:ring-2 focus-within:ring-ring',
                isSelected
                  ? 'bg-accent/40 border-primary shadow-sm'
                  : 'bg-card',
                disabled && 'cursor-not-allowed opacity-50 hover:bg-card'
              )}
            >
              <RadioGroupItem
                id={optionId}
                value={option.value}
                disabled={disabled}
              />

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {option.icon ?? (
                  <div className="h-6 w-6 rounded bg-muted-foreground/30" />
                )}
              </div>

              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-base font-semibold leading-tight text-foreground">
                  {option.label}
                </span>
                <span className="text-sm leading-normal text-muted-foreground">
                  {option.description}
                </span>
              </div>
            </label>
          );
        })}
      </RadioGroup>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="min-w-[100px]"
        >
          {continueText}
        </Button>
      </div>
    </div>
  );
}
