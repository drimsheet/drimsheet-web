import { AccountCombobox } from '@/account/components/account-combobox';
import type {
  IItemizedFieldErrors,
  IItemizedFieldValue,
} from '@/journal-entries/components/itemized-fields/types';
import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Field, FieldError } from '@/shared/components/field';
import { Label } from '@/shared/components/label';
import { MoneyWithCurrencyInput } from '@/shared/components/money-with-currency-input';
import { Textarea } from '@/shared/components/textarea';
import type { ILedgerAccountDto } from '@/shared/lib/api/Api';
import { EllipsisVertical, Plus, Trash2 } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface ItemizedFieldRowProps {
  accounts: ILedgerAccountDto[];
  disabled: boolean;
  errors?: IItemizedFieldErrors;
  index: number;
  item: IItemizedFieldValue;
  onChange: (item: IItemizedFieldValue) => void;
  onDelete: (itemId: string) => void;
}

export function ItemizedFieldRow({
  accounts,
  disabled,
  errors,
  index,
  item,
  onChange,
  onDelete,
}: Readonly<ItemizedFieldRowProps>) {
  const { t } = useTranslation<'journal-entries'>('journal-entries');

  const [descriptionVisible, setDescriptionVisible] = useState(
    Boolean(item.description)
  );

  const rowNumber = index + 1;
  const amountId = `itemized-amount-${item.id}`;
  const categoryId = `itemized-category-${item.id}`;
  const descriptionId = `itemized-description-${item.id}`;
  const amountInvalid = Boolean(errors?.amount?.length);

  const handleAmountChange = (amount: IItemizedFieldValue['amount']) => {
    onChange({
      id: item.id,
      amount: {
        amount: amount.amount,
        currencyCode: amount.currencyCode,
        isMinorUnit: amount.isMinorUnit,
      },
      accountId: item.accountId,
      description: item.description,
    });
  };

  const handleCategoryChange = (accountId: string) => {
    onChange({
      id: item.id,
      amount: {
        amount: item.amount.amount,
        currencyCode: item.amount.currencyCode,
        isMinorUnit: item.amount.isMinorUnit,
      },
      accountId,
      description: item.description,
    });
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      id: item.id,
      amount: {
        amount: item.amount.amount,
        currencyCode: item.amount.currencyCode,
        isMinorUnit: item.amount.isMinorUnit,
      },
      accountId: item.accountId,
      description: event.target.value,
    });
  };

  const amount_label = t('amount_label');
  const category_label = t('category_label');
  const category_placeholder = t('category_placeholder');
  const description_label = t('description_label');
  const item_description_placeholder = t('itemized_description_placeholder');
  const add_description_text = t('itemized_add_description_text');

  const item_menu_aria_label = t('itemized_item_menu_aria_label', {
    rowNumber,
  });

  const delete_item_text = t('itemized_delete_item_text');

  return (
    <div className="space-y-3 rounded-md bg-muted/40 p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)_auto] items-start gap-3">
        <Field data-invalid={amountInvalid}>
          <Label htmlFor={amountId}>{amount_label}</Label>
          <MoneyWithCurrencyInput
            id={amountId}
            aria-invalid={amountInvalid}
            currencyDisabled
            disabled={disabled}
            onChange={handleAmountChange}
            value={item.amount}
          />
          <FieldError errors={errors?.amount} />
        </Field>

        <AccountCombobox
          id={categoryId}
          accounts={accounts}
          disabled={disabled}
          error={errors?.accountId}
          label={category_label}
          onChange={handleCategoryChange}
          placeholder={category_placeholder}
          value={item.accountId}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={item_menu_aria_label}
              className="mt-6"
              disabled={disabled}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => onDelete(item.id)}
              variant="destructive"
            >
              <Trash2 />
              {delete_item_text}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {descriptionVisible ? (
        <Field data-invalid={Boolean(errors?.description?.length)}>
          <Label htmlFor={descriptionId}>{description_label}</Label>
          <Textarea
            id={descriptionId}
            disabled={disabled}
            onChange={handleDescriptionChange}
            placeholder={item_description_placeholder}
            rows={2}
            value={item.description}
          />
          <FieldError errors={errors?.description} />
        </Field>
      ) : (
        <Button
          className="h-auto px-0"
          disabled={disabled}
          onClick={() => setDescriptionVisible(true)}
          type="button"
          variant="link"
        >
          <Plus />
          {add_description_text}
        </Button>
      )}
    </div>
  );
}
