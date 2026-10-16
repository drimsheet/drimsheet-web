import { Button } from '@/shared/components/button';
import { ConfirmationDialog } from '@/shared/components/confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Archive, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CategoryActionsProps } from '../types';

export function CategoryActions({
  accountName,
  onArchive,
  archiveDisabled = false,
  loading = false,
  onEdit,
  editDisabled = false,
}: Readonly<CategoryActionsProps>) {
  const { t } = useTranslation('ledger-accounts');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const busy = loading || submitting;

  const handleArchive = async () => {
    if (busy || archiveDisabled) return;

    setSubmitting(true);

    try {
      await onArchive();
      setArchiveOpen(false);
    } catch {
      // The container reports the error; retain the confirmation for retry.
    } finally {
      setSubmitting(false);
    }
  };

  const edit_label = t('details_edit_label');
  const archive_label = t('details_archive_label');
  const delete_label = t('details_delete_label');
  const actions_aria_label = t('category_details_actions_aria_label');
  const confirmation_title = t('categories_archive_title');

  const confirmation_description = t('categories_archive_description', {
    name: accountName,
  });

  const confirmation_label = t(
    busy ? 'archiving_label' : 'categories_archive_label'
  );

  const cancel_label = t('archive_cancel_label');

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="outline"
        onClick={onEdit}
        disabled={editDisabled || busy}
      >
        {edit_label}
      </Button>
      <DropdownMenu>
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
              onSelect={() => setArchiveOpen(true)}
              disabled={archiveDisabled || busy}
            >
              <Archive aria-hidden="true" />
              {archive_label}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash2 aria-hidden="true" />
              {delete_label}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmationDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
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
