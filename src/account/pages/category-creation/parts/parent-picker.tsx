import { Alert, AlertDescription } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/shared/components/empty';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/components/field';
import { RadioGroup } from '@/shared/components/radio-group';
import { Separator } from '@/shared/components/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/sheet';
import { Skeleton } from '@/shared/components/skeleton';
import { Info, X } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import categoryCreationHelpers from '../helper';
import type { CategoryParentPickerProps } from '../types';
import { AccountTreeNode } from './account-tree-node';

export function CategoryParentPicker({
  type,
  parent,
  accounts,
  loading,
  error,
  disabled,
  validationError,
  onSelect,
  onOpenChange,
  onRetry,
}: Readonly<CategoryParentPickerProps>) {
  const { t } = useTranslation('ledger-accounts');
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState('');
  const pendingParent = categoryCreationHelpers.findParent(accounts, pendingId);

  const handleOpenChange = (nextOpen: boolean) => {
    setPendingId(parent?.account.id ?? '');
    setOpen(nextOpen);
    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    if (!pendingParent || loading || error) return;

    onSelect(pendingParent.account.id);
    handleOpenChange(false);
  };

  const parent_label = t('category_creation_parent_label');
  const required_label = t('category_creation_required_label');

  const select_label = parent
    ? t('category_creation_change_parent')
    : t('category_creation_select_parent');

  const empty_parent_text = t('category_creation_no_parent');
  const choose_type_text = t('category_creation_choose_type_first');
  const title = t('category_creation_select_parent');
  const description = t('category_creation_parent_description');
  const loading_label = t('category_creation_accounts_loading');
  const error_text = t('category_creation_accounts_error');
  const empty_title = t('category_creation_accounts_empty');
  const empty_description = t('category_creation_accounts_empty_description');
  const retry_label = t('categories_retry_label');
  const cancel_label = t('categories_cancel_label');
  const confirm_label = t('category_creation_use_parent');
  const close_label = t('category_creation_close_picker');
  const tree_label = t('category_creation_chart_label');
  const selected_path = pendingParent?.path.join(' / ') ?? empty_parent_text;
  const promotion_text = t('category_creation_promotion_required');

  return (
    <Field data-invalid={!!validationError}>
      <FieldLabel htmlFor={`${id}-trigger`}>
        {parent_label}
        <span className="text-xs font-normal text-muted-foreground">
          {required_label}
        </span>
      </FieldLabel>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-input bg-card p-4 sm:flex-row sm:items-center">
          <div className="min-w-0" aria-live="polite">
            <p className="break-words text-sm font-medium">
              {parent?.account.name ?? empty_parent_text}
            </p>
            {parent && (
              <p className="mt-1 break-words text-xs text-muted-foreground">
                {parent.path.join(' / ')}
              </p>
            )}
          </div>
          <SheetTrigger asChild>
            <Button
              id={`${id}-trigger`}
              aria-label={select_label}
              type="button"
              variant="outline"
              disabled={disabled || !type}
              aria-invalid={!!validationError}
              aria-describedby={validationError ? `${id}-error` : undefined}
              className="shrink-0"
            >
              {select_label}
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
        >
          <SheetHeader className="flex-row items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </div>
            <SheetClose asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={close_label}
              >
                <X />
              </Button>
            </SheetClose>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            {loading && (
              <div
                role="status"
                aria-label={loading_label}
                className="flex flex-col gap-3"
              >
                <span className="sr-only">{loading_label}</span>
                {[1, 2, 3, 4].map((row) => (
                  <Skeleton key={row} className="h-12 w-full" />
                ))}
              </div>
            )}
            {!loading && error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error_text}
                  <Button type="button" variant="outline" onClick={onRetry}>
                    {retry_label}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {!loading && !error && accounts.length === 0 && (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>{empty_title}</EmptyTitle>
                  <EmptyDescription>{empty_description}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
            {!loading && !error && accounts.length > 0 && (
              <RadioGroup
                value={pendingId}
                onValueChange={setPendingId}
                aria-label={tree_label}
              >
                <ul>
                  {accounts.map((account) => (
                    <AccountTreeNode key={account.id} account={account} />
                  ))}
                </ul>
              </RadioGroup>
            )}
          </div>
          <Separator />
          <SheetFooter>
            <div aria-live="polite" className="mb-3 flex flex-col gap-2">
              <p className="break-words text-xs text-muted-foreground">
                {selected_path}
              </p>
              {pendingParent && !pendingParent.account.isControlAccount && (
                <Alert variant="info">
                  <Info aria-hidden />
                  <AlertDescription>{promotion_text}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  {cancel_label}
                </Button>
              </SheetClose>
              <Button
                type="button"
                disabled={!pendingParent || loading || error}
                onClick={handleConfirm}
              >
                {confirm_label}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {!type && <FieldDescription>{choose_type_text}</FieldDescription>}
      {validationError && (
        <FieldError id={`${id}-error`}>{validationError}</FieldError>
      )}
    </Field>
  );
}
