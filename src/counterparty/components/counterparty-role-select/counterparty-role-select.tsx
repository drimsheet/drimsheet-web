import { Button } from '@/shared/components/button';
import { RadioGroup, RadioGroupItem } from '@/shared/components/radio-group';
import { ECounterpartyRole } from '@/shared/lib/api/Api';
import { cn } from '@/shared/lib/utils/cn';
import { BriefcaseBusiness, Contact, Store, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  CounterpartyRoleSelectProps,
  ICounterpartyRoleOption,
  UCounterpartyRoleSelectValue,
} from './types';

export function CounterpartyRoleSelect({
  defaultValue,
  value,
  onSubmit,
  disabled = false,
  className,
}: Readonly<CounterpartyRoleSelectProps>) {
  const { t } = useTranslation(['counterparty']);

  const [internalSelected, setInternalSelected] = useState(
    value ?? defaultValue
  );

  const selectedValue = value !== undefined ? value : internalSelected;

  const options: ICounterpartyRoleOption[] = [
    {
      value: 'default',
      label: t('counterparty:default_counterparty_label'),
      description: t(
        'counterparty:select_counterparty_role_default_description'
      ),
      icon: <Contact className="h-6 w-6 text-muted-foreground" />,
    },

    {
      value: ECounterpartyRole.Vendor,
      label: t('counterparty:vendor_label'),
      description: t(
        'counterparty:select_counterparty_role_vendor_description'
      ),
      icon: <Store className="h-6 w-6 text-muted-foreground" />,
    },

    {
      value: ECounterpartyRole.Contractor,
      label: t('counterparty:contractor_label'),
      description: t(
        'counterparty:select_counterparty_role_contractor_description'
      ),
      icon: <Wrench className="h-6 w-6 text-muted-foreground" />,
    },

    {
      value: ECounterpartyRole.Employer,
      label: t('counterparty:employer_label'),
      description: t(
        'counterparty:select_counterparty_role_employer_description'
      ),
      icon: <BriefcaseBusiness className="h-6 w-6 text-muted-foreground" />,
    },
  ];

  const canSubmit = Boolean(selectedValue && !disabled);

  const handleSelect = (optionValue: UCounterpartyRoleSelectValue) => {
    if (disabled) return;

    if (value === undefined) {
      setInternalSelected(optionValue);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit || !selectedValue) return;

    onSubmit(selectedValue);
  };

  const title = t('counterparty:select_counterparty_role_title');
  const continueText = t('counterparty:continue');

  return (
    <div className={cn('flex w-full max-w-lg flex-col gap-6 p-2', className)}>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>

      <RadioGroup
        value={selectedValue ?? ''}
        defaultValue={defaultValue ?? ''}
        onValueChange={(val) =>
          handleSelect(val as UCounterpartyRoleSelectValue)
        }
        aria-label={title}
        disabled={disabled}
        className="flex flex-col gap-3"
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          const optionId = `counterparty-role-${option.value}`;

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
