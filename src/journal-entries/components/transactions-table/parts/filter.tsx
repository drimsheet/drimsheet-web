import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { DateInput } from '@/shared/components/date-input';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/popover';
import { SearchField } from '@/shared/components/search-field';
import { Separator } from '@/shared/components/separator';
import { EJournalEntrySourceType } from '@/shared/lib/api/Api';
import { ListFilter } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import transactionsTableHelpers from '../helper';
import type {
  IJournalEntryTableFilters,
  JournalEntryTableFilterProps,
  UJournalEntryFilterField,
} from '../types';
import { hasInvalidFilterDates } from '../validation';
import { JournalEntryFilterOptions } from './filter-options';

export function JournalEntryTableFilter({
  value,
  onApply,
  options,
  optionsLoading,
  optionsError,
  search,
  onSearchChange,
}: Readonly<JournalEntryTableFilterProps>) {
  const { t } = useTranslation(['journal-entries', 'shared']);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<UJournalEntryFilterField>('effectiveDate');
  const [draft, setDraft] = useState<IJournalEntryTableFilters>({});

  const labels = {
    effectiveDate: t('journal-entries:transaction_filter_effective_date_label'),
    recordedDate: t('journal-entries:transaction_filter_recorded_date_label'),
    sourceType: t('journal-entries:transaction_filter_source_type_label'),
    accountId: t('journal-entries:transaction_filter_account_id_label'),
    categoryId: t('journal-entries:transaction_filter_category_id_label'),
    counterpartyId: t(
      'journal-entries:transaction_filter_counterparty_id_label'
    ),
    currencyCode: t('journal-entries:transaction_filter_currency_code_label'),
  };

  const fields = transactionsTableHelpers.filterFields();

  const activeFields = fields.filter((key) =>
    transactionsTableHelpers.filterValue(value, key)
  );

  const isDate = field === 'effectiveDate' || field === 'recordedDate';

  const dateFromKey =
    field === 'effectiveDate' ? 'effectiveDateFrom' : 'recordedDateFrom';

  const dateToKey =
    field === 'effectiveDate' ? 'effectiveDateTo' : 'recordedDateTo';

  const invalidDates = hasInvalidFilterDates(draft);

  const optionSets = {
    accountId: options.accounts,
    categoryId: options.categories,
    counterpartyId: options.counterparties,
    currencyCode: options.currencies,
    sourceType: [
      {
        value: EJournalEntrySourceType.Receipt,
        label: t('journal-entries:transaction_filters_inflow_label'),
      },
      {
        value: EJournalEntrySourceType.Payment,
        label: t('journal-entries:transaction_filters_outflow_label'),
      },
      {
        value: EJournalEntrySourceType.Transfer,
        label: t('journal-entries:transaction_filters_transfer_label'),
      },
    ],
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft({ ...value });
    }

    setOpen(next);
  };

  const handleApply = () => {
    if (invalidDates) {
      return;
    }

    onApply(draft);
    setOpen(false);
  };

  const handleFromChange = (value: string) => {
    setDraft((current) => ({ ...current, [dateFromKey]: value }));
  };

  const handleToChange = (value: string) => {
    setDraft((current) => ({ ...current, [dateToKey]: value }));
  };

  const handleClearAll = () => {
    setDraft({});
  };

  const handleClearFilters = () => {
    onApply({});
  };

  const handleOptionChange = (next: string | undefined) => {
    if (field === 'accountId') {
      setDraft((current) => ({
        ...current,
        accountId: next,
        categoryId: next ? undefined : current.categoryId,
      }));
    } else if (field === 'categoryId') {
      setDraft((current) => ({
        ...current,
        categoryId: next,
        accountId: next ? undefined : current.accountId,
      }));
    } else if (field === 'sourceType') {
      const sourceType = optionSets.sourceType.find(
        (option) => option.value === next
      )?.value;

      setDraft((current) => ({ ...current, sourceType }));
    } else if (!isDate) {
      setDraft((current) => ({ ...current, [field]: next }));
    }
  };

  const filters_label = t('journal-entries:transaction_filters_label');
  const search_label = t('journal-entries:transaction_search_placeholder');
  const clear_label = t('journal-entries:transaction_filters_clear_all_label');

  const clear_filters_label = t(
    'journal-entries:transaction_filters_clear_label'
  );

  const cancel_label = t('shared:cancel');
  const apply_label = t('journal-entries:transaction_filters_apply_label');

  const date_placeholder = t(
    'journal-entries:cash_transaction_date_placeholder'
  );

  const from_label = t('journal-entries:transaction_filters_from_label');
  const to_label = t('journal-entries:transaction_filters_to_label');
  const field_label = labels[field];

  const invalid_dates_text = t(
    'journal-entries:transaction_filters_invalid_dates'
  );

  const exclusive_description = t(
    'journal-entries:transaction_filters_account_category_description'
  );

  const recorded_date_description = t(
    'journal-entries:transaction_filters_recorded_date_description'
  );

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-80">
          <SearchField
            aria-label={search_label}
            placeholder={search_label}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant={activeFields.length > 0 ? 'secondary' : 'outline'}
              type="button"
            >
              <ListFilter data-icon="inline-start" />
              {filters_label}
              {activeFields.length > 0 && (
                <Badge variant="neutral">{activeFields.length}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            collisionPadding={16}
            aria-label={filters_label}
            className="w-[560px] max-w-[calc(100vw-2rem)] gap-0 overflow-y-auto border border-border p-0 shadow-none ring-0 max-h-[var(--radix-popover-content-available-height)]"
          >
            <div className="grid min-h-80 grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)]">
              <nav
                aria-label={filters_label}
                className="grid grid-cols-2 content-start gap-1 border-b border-border p-3 sm:grid-cols-1 sm:border-r sm:border-b-0"
              >
                {fields.map((key) => {
                  const label = labels[key];
                  const selected = field === key;

                  const active = Boolean(
                    transactionsTableHelpers.filterValue(draft, key)
                  );

                  return (
                    <Button
                      key={key}
                      type="button"
                      variant={selected ? 'default' : 'ghost'}
                      aria-pressed={selected}
                      className="justify-between"
                      onClick={() => setField(key)}
                    >
                      {label}
                      {active && <span aria-hidden>•</span>}
                    </Button>
                  );
                })}
              </nav>
              <div className="min-w-0 p-5">
                {isDate && (
                  <FieldGroup>
                    <div className="text-sm font-medium">{field_label}</div>
                    <Field data-invalid={invalidDates}>
                      <FieldLabel htmlFor={`${id}-from`}>
                        {from_label}
                      </FieldLabel>
                      <DateInput
                        id={`${id}-from`}
                        value={draft[dateFromKey]}
                        placeholder={date_placeholder}
                        aria-invalid={invalidDates}
                        aria-describedby={
                          invalidDates ? `${id}-date-error` : undefined
                        }
                        onValueChange={handleFromChange}
                      />
                    </Field>
                    <Field data-invalid={invalidDates}>
                      <FieldLabel htmlFor={`${id}-to`}>{to_label}</FieldLabel>
                      <DateInput
                        id={`${id}-to`}
                        value={draft[dateToKey]}
                        placeholder={date_placeholder}
                        aria-invalid={invalidDates}
                        aria-describedby={
                          invalidDates ? `${id}-date-error` : undefined
                        }
                        onValueChange={handleToChange}
                      />
                    </Field>
                    {field === 'recordedDate' && (
                      <FieldDescription>
                        {recorded_date_description}
                      </FieldDescription>
                    )}
                  </FieldGroup>
                )}
                {field !== 'effectiveDate' && field !== 'recordedDate' && (
                  <JournalEntryFilterOptions
                    key={field}
                    label={field_label}
                    value={draft[field]}
                    options={optionSets[field]}
                    onChange={handleOptionChange}
                    loading={field !== 'sourceType' && optionsLoading}
                    error={field !== 'sourceType' && optionsError}
                    select={field === 'currencyCode' || field === 'sourceType'}
                  />
                )}
                {(field === 'accountId' || field === 'categoryId') && (
                  <FieldDescription className="mt-4">
                    {exclusive_description}
                  </FieldDescription>
                )}
              </div>
            </div>
            {invalidDates && (
              <FieldError id={`${id}-date-error`} className="px-4 pb-3">
                {invalid_dates_text}
              </FieldError>
            )}
            <Separator />
            <div className="flex flex-wrap items-center justify-between gap-2 p-3">
              <Button type="button" variant="ghost" onClick={handleClearAll}>
                {clear_label}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  {cancel_label}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={invalidDates}
                  onClick={handleApply}
                >
                  {apply_label}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {activeFields.length > 0 && (
          <Button type="button" variant="ghost" onClick={handleClearFilters}>
            {clear_filters_label}
          </Button>
        )}
      </div>
    </div>
  );
}
