import { TransactionDetails } from '@/journal-entries/components/transaction-details';
import { Button } from '@/shared/components/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/sheet';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TransactionArchiveAction } from './parts/transaction-archive-action';
import { TransactionDeleteAction } from './parts/transaction-delete-action';
import type { TransactionDetailsDrawerProps } from './types';

export function TransactionDetailsDrawer({
  archiving = false,
  onArchive,
  onDelete,
  details,
  editDisabled = false,
  onEdit,
  onOpenChange,
  open,
}: Readonly<TransactionDetailsDrawerProps>) {
  const { t } = useTranslation('journal-entries');

  const handleOpenChange = (nextOpen: boolean) => {
    if (archiving) return;

    onOpenChange(nextOpen);
  };

  if (!details) return null;

  const details_title = t('transaction_details_title');
  const details_description = t('transaction_details_description');
  const close_action = t('transaction_details_close_action');
  const edit_label = t('edit_entry_label');

  return (
    <Sheet onOpenChange={handleOpenChange} open={open}>
      <SheetContent className="gap-0 p-0 sm:max-w-md" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between border-b border-border px-5 py-4">
          <div>
            <SheetTitle>{details_title}</SheetTitle>
            <SheetDescription className="sr-only">
              {details_description}
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button
              aria-label={close_action}
              disabled={archiving}
              size="icon-sm"
              title={close_action}
              type="button"
              variant="ghost"
            >
              <X />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          <TransactionDetails details={details} />
        </div>

        <SheetFooter className="flex-row items-center justify-between border-t border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <TransactionArchiveAction
              loading={archiving}
              onArchive={onArchive}
            />

            <TransactionDeleteAction
              disabled={archiving}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          </div>
          <Button
            disabled={editDisabled || archiving}
            onClick={onEdit}
            type="button"
          >
            {edit_label}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
