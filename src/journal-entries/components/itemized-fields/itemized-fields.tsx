import { ItemizedFieldRow } from '@/journal-entries/components/itemized-fields/parts/itemized-field-row';
import { ItemizedFieldViewRow } from '@/journal-entries/components/itemized-fields/parts/itemized-field-view-row';
import type {
  IItemizedFieldValue,
  ItemizedFieldsProps,
} from '@/journal-entries/components/itemized-fields/types';
import { Button } from '@/shared/components/button';
import { FieldError } from '@/shared/components/field';
import { generateUUID } from '@/shared/lib/utils/uuid';
import { Plus, Save as SaveIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import itemizedFieldsHelpers from './helper';

export function ItemizedFields({
  accounts,
  currencyCode,
  defaultValue = [],
  disabled = false,
  excludeSelectedAccounts = false,
  initialEditItemId,
  onChange,
  onEditModeChange,
}: Readonly<ItemizedFieldsProps>) {
  const { t } = useTranslation<'journal-entries'>('journal-entries');

  const [items, setItems] = useState<IItemizedFieldValue[]>(() =>
    defaultValue.map((item) => ({
      id: item.id,
      amount: {
        amount: item.amount.amount,
        currencyCode,
        isMinorUnit: item.amount.isMinorUnit,
      },
      accountId: item.accountId,
      description: item.description,
    }))
  );

  const [draftItem, setDraftItem] = useState<IItemizedFieldValue | null>(() => {
    const initialEditItem = defaultValue.find(
      (item) => item.id === initialEditItemId
    );

    if (!initialEditItem) return null;

    return {
      id: initialEditItem.id,
      amount: {
        amount: initialEditItem.amount.amount,
        currencyCode,
        isMinorUnit: initialEditItem.amount.isMinorUnit,
      },
      accountId: initialEditItem.accountId,
      description: initialEditItem.description,
    };
  });

  const [saveAttempted, setSaveAttempted] = useState(false);

  const draftErrors = draftItem
    ? itemizedFieldsHelpers.getErrors([draftItem], {
        amountPositive: t('itemized_amount_positive_text'),
        amountRequired: t('itemized_amount_required_text'),
        categoryRequired: t('itemized_category_required_text'),
      })[draftItem.id]
    : undefined;

  const draftHasErrors = Boolean(
    draftErrors?.amount?.length ||
    draftErrors?.accountId?.length ||
    draftErrors?.description?.length
  );

  const draftReplacesCommittedItem = Boolean(
    draftItem && items.some((item) => item.id === draftItem.id)
  );

  const availableAccounts =
    excludeSelectedAccounts && draftItem
      ? itemizedFieldsHelpers.getAvailableAccounts(accounts, items, draftItem)
      : accounts;

  const handleDraftItemOpen = (item: IItemizedFieldValue) => {
    setDraftItem(item);
    setSaveAttempted(false);
    onEditModeChange?.(true);
  };

  const handleDraftItemClose = () => {
    setDraftItem(null);
    setSaveAttempted(false);
    onEditModeChange?.(false);
  };

  const handleItemChange = (changedItem: IItemizedFieldValue) => {
    setDraftItem({
      id: changedItem.id,
      amount: {
        amount: changedItem.amount.amount,
        currencyCode,
        isMinorUnit: changedItem.amount.isMinorUnit,
      },
      accountId: changedItem.accountId,
      description: changedItem.description,
    });
  };

  const handleEditItem = (itemId: string) => {
    if (draftItem) return;

    const item = items.find((candidate) => candidate.id === itemId);
    if (!item) return;

    handleDraftItemOpen({
      id: item.id,
      amount: {
        amount: item.amount.amount,
        currencyCode,
        isMinorUnit: item.amount.isMinorUnit,
      },
      accountId: item.accountId,
      description: item.description,
    });
  };

  const handleAddItem = () => {
    if (draftItem) return;

    handleDraftItemOpen(
      itemizedFieldsHelpers.createItem(generateUUID(), currencyCode)
    );
  };

  const handleSaveItem = () => {
    if (!draftItem) return;

    setSaveAttempted(true);
    if (draftHasErrors) return;

    const savedItem: IItemizedFieldValue = {
      id: draftItem.id,
      amount: {
        amount: draftItem.amount.amount,
        currencyCode,
        isMinorUnit: draftItem.amount.isMinorUnit,
      },
      accountId: draftItem.accountId,
      description: draftItem.description,
    };

    const nextItems = draftReplacesCommittedItem
      ? items.map((item) => (item.id === savedItem.id ? savedItem : item))
      : [...items, savedItem];

    setItems(nextItems);
    handleDraftItemClose();
    onChange(nextItems);
  };

  const handleDeleteItem = (itemId: string) => {
    const committedItemExists = items.some((item) => item.id === itemId);
    const activeDraftItemDeleted = draftItem?.id === itemId;

    if (!committedItemExists) {
      if (activeDraftItemDeleted) handleDraftItemClose();

      return;
    }

    const nextItems = items.filter((item) => item.id !== itemId);

    setItems(nextItems);
    if (activeDraftItemDeleted) handleDraftItemClose();

    onChange(nextItems);
  };

  const items_required_text = t('itemized_items_required_text');
  const add_item_text = t('itemized_add_item_text');
  const save_item_text = t('itemized_save_item_text');

  const itemsError =
    items.length || draftItem ? [] : [{ message: items_required_text }];

  return (
    <div className="space-y-3 p-3">
      {items.map((item, index) => {
        if (draftItem?.id === item.id) {
          return (
            <ItemizedFieldRow
              key={item.id}
              accounts={availableAccounts}
              disabled={disabled}
              errors={saveAttempted ? draftErrors : undefined}
              index={index}
              item={draftItem}
              onChange={handleItemChange}
              onDelete={handleDeleteItem}
            />
          );
        }

        const categoryName =
          accounts.find((account) => account.id === item.accountId)?.name ??
          item.accountId;

        return (
          <ItemizedFieldViewRow
            key={item.id}
            categoryName={categoryName}
            disabled={disabled}
            editDisabled={Boolean(draftItem)}
            index={index}
            item={item}
            onDelete={handleDeleteItem}
            onEdit={handleEditItem}
          />
        );
      })}

      {draftItem && !draftReplacesCommittedItem && (
        <ItemizedFieldRow
          accounts={availableAccounts}
          disabled={disabled}
          errors={saveAttempted ? draftErrors : undefined}
          index={items.length}
          item={draftItem}
          onChange={handleItemChange}
          onDelete={handleDeleteItem}
        />
      )}

      <FieldError errors={itemsError} />

      <Button
        disabled={disabled}
        onClick={draftItem ? handleSaveItem : handleAddItem}
        size="sm"
        type="button"
        variant="secondary"
      >
        {draftItem ? <SaveIcon /> : <Plus />}
        {draftItem ? save_item_text : add_item_text}
      </Button>
    </div>
  );
}
