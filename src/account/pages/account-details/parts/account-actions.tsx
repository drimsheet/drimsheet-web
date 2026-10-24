import { Button } from '@/shared/components/button';
import { ConfirmationDialog } from '@/shared/components/confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemSkeleton,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Skeleton } from '@/shared/components/skeleton';
import { Archive, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccountActionsProps } from '../types';

export function AccountActions({
  archiveDisabled = false,
  isControlAccount = false,
  loading = false,
  onArchive,
  deleteEligibilityChecking = false,
  deleteEligibilityFailed = false,
  deletable = false,
  onActionsOpenChange,
  onDelete,
  onEdit,
}: Readonly<AccountActionsProps>) {
  const { t } = useTranslation('ledger-accounts');
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const busy = loading || submitting;

  const handleArchive = async () => {
    if (busy || archiveDisabled) return;

    setSubmitting(true);

    try {
      await onArchive();
      setOpen(false);
    } catch {
      // The container reports the error; retain the dialog and its error state.
    } finally {
      setSubmitting(false);
    }
  };

  const edit_label = t('details_edit_label');
  const archive_label = t('details_archive_label');
  const delete_label = t('details_delete_label');
  const actions_aria_label = t('details_actions_aria_label');
  const confirmation_title = t('archive_confirmation_title');

  const confirmation_description = t(
    isControlAccount
      ? 'archive_control_confirmation_description'
      : 'archive_confirmation_description'
  );

  const confirmation_label = t('archive_confirmation_action');

  const cancel_label = t('archive_cancel_label');
  const checking_label = t('checking_deletion_eligibility_text');
  const eligibility_error_text = t('deletion_eligibility_error_text');

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button variant="outline" disabled={busy || !onEdit} onClick={onEdit}>
        {edit_label}
      </Button>
      <DropdownMenu onOpenChange={onActionsOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={actions_aria_label}
            disabled={busy}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={archiveDisabled || busy}
              onSelect={() => setOpen(true)}
            >
              <Archive aria-hidden="true" />
              {archive_label}
            </DropdownMenuItem>
            {deleteEligibilityChecking && (
              <DropdownMenuItemSkeleton aria-label={checking_label} />
            )}
            {!deleteEligibilityChecking && deleteEligibilityFailed && (
              <DropdownMenuLabel className="whitespace-normal">
                {eligibility_error_text}
              </DropdownMenuLabel>
            )}
            {!deleteEligibilityChecking &&
              !deleteEligibilityFailed &&
              deletable &&
              onDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={onDelete}
                  disabled={busy}
                >
                  <Trash2 aria-hidden="true" />
                  {delete_label}
                </DropdownMenuItem>
              )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleArchive}
        loading={busy}
        title={confirmation_title}
        confirmationText={confirmation_label}
        cancelText={cancel_label}
        media={<Archive aria-hidden="true" />}
        trigger={null}
      >
        {confirmation_description}
      </ConfirmationDialog>
    </div>
  );
}

export function AccountActionsSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_account_actions');

  return (
    <div aria-busy="true" className="flex shrink-0 items-center gap-2">
      <output className="sr-only" aria-label={loading_label}>
        {loading_label}
      </output>
      <Skeleton className="h-9 w-12" />
      <Skeleton className="size-9" />
    </div>
  );
}
