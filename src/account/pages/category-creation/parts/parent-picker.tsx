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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/components/input-group';
import { RadioGroup } from '@/shared/components/radio-group';
import { Separator } from '@/shared/components/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/sheet';
import { ChevronRight, Search, X } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import categoryCreationHelpers from '../helper';
import type { CategoryParentPickerProps } from '../types';
import { AccountTreeNode, AccountTreeNodeSkeleton } from './account-tree-node';

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
}: Readonly<CategoryParentPickerProps>) {
  const { t } = useTranslation('ledger-accounts');
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState('');
  const [search, setSearch] = useState('');

  const matchingAccounts = accounts.filter((account) =>
    categoryCreationHelpers.matchesSearch(account, search)
  );

  const pendingParent = categoryCreationHelpers.findParent(accounts, pendingId);

  const handleOpenChange = (nextOpen: boolean) => {
    setSearch('');
    setPendingId(parent?.account.id ?? '');
    setOpen(nextOpen);
    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    if (!pendingParent || loading || error) {
      return;
    }

    onSelect(pendingParent.account.id);
    handleOpenChange(false);
  };

  const parent_label = t('category_creation_parent_label');

  const select_label = parent
    ? t('category_creation_change_parent')
    : t('category_creation_select_parent');

  const empty_parent_text = t('category_creation_no_parent');
  const choose_type_text = t('category_creation_choose_type_first');
  const title = t('category_creation_select_parent');
  const loading_label = t('category_creation_accounts_loading');
  const error_text = t('category_creation_accounts_error');
  const empty_title = t('category_creation_accounts_empty');
  const empty_description = t('category_creation_accounts_empty_description');
  const cancel_label = t('categories_cancel_label');
  const confirm_label = t('category_creation_use_parent');
  const close_label = t('category_creation_close_picker');
  const tree_label = t('category_creation_chart_label');
  const search_placeholder = t('category_creation_search_placeholder');
  const no_results_title = t('category_creation_search_empty');

  const no_results_description = t(
    'category_creation_search_empty_description'
  );

  return (
    <Field data-invalid={!!validationError}>
      <FieldLabel htmlFor={`${id}-trigger`}>{parent_label}</FieldLabel>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button
            id={`${id}-trigger`}
            aria-label={select_label}
            type="button"
            variant="outline"
            disabled={disabled || !type}
            aria-invalid={!!validationError}
            aria-describedby={validationError ? `${id}-error` : undefined}
            className="h-auto min-h-16 w-full justify-between gap-4 bg-muted px-3 py-3 text-left whitespace-normal"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="break-words font-medium">
                {parent?.account.name ?? empty_parent_text}
              </span>
              {parent && parent.path.length > 1 && (
                <span className="break-words text-xs font-normal text-muted-foreground">
                  {parent.path.slice(0, -1).join(' / ')}
                </span>
              )}
            </span>
            <ChevronRight className="shrink-0" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          aria-describedby={undefined}
          showCloseButton={false}
          className="data-[side=right]:w-full data-[side=right]:sm:max-w-md"
        >
          <SheetHeader className="flex-row items-start justify-between gap-4 p-6 pb-0">
            <div className="flex min-w-0 flex-col gap-2">
              <SheetTitle>{title}</SheetTitle>
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
          <div className="px-6">
            <InputGroup>
              <InputGroupInput
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={search_placeholder}
                aria-label={search_placeholder}
              />
              <InputGroupAddon>
                <Search aria-hidden />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
            {loading && (
              <div className="flex flex-col gap-3">
                <output className="sr-only" aria-label={loading_label}>
                  {loading_label}
                </output>
                <ul>
                  {[1, 2, 3, 4].map((row) => (
                    <AccountTreeNodeSkeleton key={row} />
                  ))}
                </ul>
              </div>
            )}
            {!loading && error && (
              <Alert variant="destructive">
                <AlertDescription>{error_text}</AlertDescription>
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
            {!loading &&
              !error &&
              accounts.length > 0 &&
              matchingAccounts.length === 0 && (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>{no_results_title}</EmptyTitle>
                    <EmptyDescription>
                      {no_results_description}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            {!loading && !error && matchingAccounts.length > 0 && (
              <RadioGroup
                value={pendingId}
                onValueChange={setPendingId}
                aria-label={tree_label}
              >
                <ul>
                  {matchingAccounts.map((account) => (
                    <AccountTreeNode
                      key={`${account.id}-${!!search.trim()}`}
                      account={account}
                      search={search}
                    />
                  ))}
                </ul>
              </RadioGroup>
            )}
          </div>
          <Separator />
          <SheetFooter className="p-6">
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
