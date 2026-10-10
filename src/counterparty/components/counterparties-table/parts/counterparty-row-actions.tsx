import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Skeleton } from '@/shared/components/skeleton';
import {
  ECounterpartyStatus,
  type ICounterpartyDto,
} from '@/shared/lib/api/Api';
import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CounterpartyArchiveAction,
  CounterpartyArchiveConfirmation,
} from './counterparty-archive-action';
import { CounterpartyDeleteAction } from './counterparty-delete-action';
import { CounterpartyEditAction } from './counterparty-edit-action';

interface CounterpartyRowActionsProps {
  archiving?: boolean;
  counterparty: ICounterpartyDto;
  onArchive?: (counterparty: ICounterpartyDto) => Promise<void>;
  onCheckDeleteEligibility?: (
    counterparty: ICounterpartyDto
  ) => Promise<boolean>;
  onDelete?: (counterparty: ICounterpartyDto) => void;
  onEdit?: (counterparty: ICounterpartyDto) => void;
}

export function CounterpartyRowActions({
  archiving = false,
  counterparty,
  onArchive,
  onCheckDeleteEligibility,
  onDelete,
  onEdit,
}: Readonly<CounterpartyRowActionsProps>) {
  const { t } = useTranslation('counterparty');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [checkingDeleteEligibility, setCheckingDeleteEligibility] =
    useState(false);

  const [canDelete, setCanDelete] = useState(false);

  const disabled = counterparty.status === ECounterpartyStatus.Archived;

  const handleEdit = () => {
    onEdit?.(counterparty);
  };

  const handleArchive = async () => {
    await onArchive?.(counterparty);
  };

  const handleCheckDeleteEligibility = async () => {
    if (!onCheckDeleteEligibility || !onDelete) return;

    setCanDelete(false);
    setCheckingDeleteEligibility(true);

    try {
      setCanDelete(await onCheckDeleteEligibility(counterparty));
    } catch {
      setCanDelete(false);
    } finally {
      setCheckingDeleteEligibility(false);
    }
  };

  const handleMenuOpenChange = (open: boolean) => {
    setMenuOpen(open);
    if (open) void handleCheckDeleteEligibility();
  };

  const handleDelete = () => {
    onDelete?.(counterparty);
  };

  const actions_menu_aria_label = t('actions_menu_aria_label');

  const checking_deletion_eligibility_text = t(
    'checking_deletion_eligibility_text'
  );

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={handleMenuOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={actions_menu_aria_label}
            disabled={archiving}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Ellipsis aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <CounterpartyEditAction
            disabled={disabled || !onEdit}
            onSelect={handleEdit}
          />
          <CounterpartyArchiveAction
            disabled={disabled || archiving || !onArchive}
            onSelect={() => setArchiveOpen(true)}
          />
          {checkingDeleteEligibility && (
            <DropdownMenuItem
              aria-label={checking_deletion_eligibility_text}
              disabled
            >
              <Skeleton className="h-5 w-full" />
            </DropdownMenuItem>
          )}
          {!checkingDeleteEligibility && canDelete && (
            <CounterpartyDeleteAction onSelect={handleDelete} />
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {onArchive && (
        <CounterpartyArchiveConfirmation
          loading={archiving}
          onArchive={handleArchive}
          onOpenChange={setArchiveOpen}
          open={archiveOpen}
        />
      )}
    </>
  );
}
