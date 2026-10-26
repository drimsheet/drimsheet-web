import {
  Field,
  FieldError,
  FieldLegend,
  FieldSet,
} from '@/shared/components/field';
import { RadioGroup, RadioGroupItem } from '@/shared/components/radio-group';
import { EAccountingEntityType } from '@/shared/lib/api/Api';
import { BriefcaseBusiness, Building2, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EntityTypeCardsProps } from '../types';

export function EntityTypeCards({
  id,
  value,
  disabled,
  errors,
  onChange,
  onBlur,
}: Readonly<EntityTypeCardsProps>) {
  const { t } = useTranslation('accounting');

  const options = [
    {
      value: EAccountingEntityType.Individual,
      label: t('entity_type_individual_label'),
      description: t('entity_type_individual_description'),
      icon: UserRound,
    },
    {
      value: EAccountingEntityType.SoleTrader,
      label: t('entity_type_sole_trader_label'),
      description: t('entity_type_sole_trader_description'),
      icon: BriefcaseBusiness,
    },
    {
      value: EAccountingEntityType.PrivateCompany,
      label: t('entity_type_company_label'),
      description: t('entity_type_company_description'),
      icon: Building2,
    },
  ];

  const handleValueChange = (nextValue: string) => {
    const option = options.find((option) => option.value === nextValue);

    if (option) {
      onChange(option.value);
    }
  };

  const type_label = t('entity_type_label');

  return (
    <FieldSet className="@container/entity-types gap-3" disabled={disabled}>
      <FieldLegend id={`${id}-label`} variant="label">
        {type_label}
      </FieldLegend>
      <Field data-invalid={errors.length > 0} data-disabled={disabled}>
        <RadioGroup
          name="entityType"
          value={value}
          onValueChange={handleValueChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-labelledby={`${id}-label`}
          aria-invalid={errors.length > 0}
          aria-describedby={errors.length ? `${id}-error` : undefined}
          className="@min-[36rem]/entity-types:grid-cols-3"
        >
          {options.map(
            ({ value: optionValue, label, description, icon: Icon }) => (
              <label
                key={optionValue}
                htmlFor={`${id}-${optionValue}`}
                className="flex min-h-40 min-w-0 cursor-pointer flex-col items-start rounded-md border border-input bg-background p-4.5 text-foreground hover:bg-muted has-[[aria-checked=true]]:border-link has-[[aria-checked=true]]:bg-selection has-[[aria-checked=true]]:ring-1 has-[[aria-checked=true]]:ring-inset has-[[aria-checked=true]]:ring-link has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ring has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
              >
                <RadioGroupItem
                  id={`${id}-${optionValue}`}
                  value={optionValue}
                  aria-labelledby={`${id}-${optionValue}-name`}
                  aria-describedby={`${id}-${optionValue}-description`}
                  aria-invalid={errors.length > 0}
                />
                <span className="mt-auto mb-3 shrink-0 pt-3">
                  <Icon aria-hidden className="size-6" strokeWidth={1.5} />
                </span>
                <span
                  id={`${id}-${optionValue}-name`}
                  className="mb-1.5 text-sm leading-snug font-medium"
                >
                  {label}
                </span>
                <span
                  id={`${id}-${optionValue}-description`}
                  className="text-xs leading-normal text-muted-foreground"
                >
                  {description}
                </span>
              </label>
            )
          )}
        </RadioGroup>
        <FieldError id={`${id}-error`} errors={errors} />
      </Field>
    </FieldSet>
  );
}
