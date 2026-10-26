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
import { Archive, Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccountDetailsActionsProps } from '../types';

export function AccountDetailsActions({
  account,
  busy = false,
  checking = false,
  eligibilityFailed = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onArchive,
  onDelete,
}: Readonly<AccountDetailsActionsProps>) {
  const { t } = useTranslation('ledger-accounts');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const archived = account.status === 'archived';

  const editable =
    account.behavior === 'bank' || account.behavior === 'petty_cash';

  const handleArchive = async () => {
    try {
      await onArchive();
    } finally {
      setArchiveOpen(false);
    }
  };

  const actions_label = t('details_actions_aria_label');
  const edit_label = t('details_edit_label');
  const archive_label = t('details_archive_label');
  const delete_label = t('details_delete_label');
  const checking_label = t('checking_deletion_eligibility_text');
  const error_text = t('deletion_eligibility_error_text');
  const archive_title = t('archive_confirmation_title');
  const archive_description = t('archive_confirmation_description');
  const archive_action = t('archive_confirmation_action');
  const cancel_label = t('archive_cancel_label');

  return (
    <>
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={actions_label}
            variant="ghost"
            size="icon-sm"
            loading={busy}
          >
            <Ellipsis aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={busy || archived || !editable}
              onSelect={onEdit}
            >
              <Pencil aria-hidden />
              {edit_label}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={busy || archived}
              onSelect={() => setArchiveOpen(true)}
            >
              <Archive aria-hidden />
              {archive_label}
            </DropdownMenuItem>
            {checking && (
              <DropdownMenuItemSkeleton aria-label={checking_label} />
            )}
            {!checking && eligibilityFailed && (
              <DropdownMenuLabel className="whitespace-normal">
                {error_text}
              </DropdownMenuLabel>
            )}
            {!checking && !eligibilityFailed && canDelete && (
              <DropdownMenuItem
                disabled={busy}
                variant="destructive"
                onSelect={onDelete}
              >
                <Trash2 aria-hidden />
                {delete_label}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmationDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        onConfirm={handleArchive}
        loading={busy}
        title={archive_title}
        confirmationText={archive_action}
        cancelText={cancel_label}
        media={<Archive aria-hidden />}
        trigger={null}
      >
        {archive_description}
      </ConfirmationDialog>
    </>
  );
}
