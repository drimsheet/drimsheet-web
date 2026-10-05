import { Field, FieldError } from '@/shared/components/field';
import { Label } from '@/shared/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { useTranslation } from 'react-i18next';
import type { CounterpartyTypeSelectProps } from './types';

export function CounterpartyTypeSelect({
  value,
  onChange,
  error,
  disabled = false,
  description,
}: Readonly<CounterpartyTypeSelectProps>) {
  const { t } = useTranslation(['counterparty']);

  const descriptionId = 'counterparty-type-description';
  const errorId = 'counterparty-type-error';
  const hasError = Boolean(error?.some((item) => item?.message));

  const type_label = t('counterparty:type_label');
  const select_placeholder = t('counterparty:select_placeholder');
  const individual_label = t('counterparty:individual_label');
  const organization_label = t('counterparty:organization_label');

  return (
    <Field>
      <Label htmlFor="counterparty-type">{type_label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id="counterparty-type"
          aria-invalid={hasError}
          aria-describedby={
            [hasError ? errorId : '', description ? descriptionId : '']
              .filter(Boolean)
              .join(' ') || undefined
          }
          className="w-full"
        >
          <SelectValue placeholder={select_placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="individual">{individual_label}</SelectItem>
          <SelectItem value="organization">{organization_label}</SelectItem>
        </SelectContent>
      </Select>
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      <FieldError id={errorId} errors={error} />
    </Field>
  );
}
