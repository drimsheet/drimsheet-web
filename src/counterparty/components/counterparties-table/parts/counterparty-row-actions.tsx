import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
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
import { CounterpartyEditAction } from './counterparty-edit-action';

interface CounterpartyRowActionsProps {
  archiving?: boolean;
  counterparty: ICounterpartyDto;
  onArchive?: (counterparty: ICounterpartyDto) => Promise<void>;
  onEdit?: (counterparty: ICounterpartyDto) => void;
}

export function CounterpartyRowActions({
  archiving = false,
  counterparty,
  onArchive,
  onEdit,
}: Readonly<CounterpartyRowActionsProps>) {
  const { t } = useTranslation('counterparty');
  const [archiveOpen, setArchiveOpen] = useState(false);

  const disabled = counterparty.status === ECounterpartyStatus.Archived;

  const handleEdit = () => {
    onEdit?.(counterparty);
  };

  const handleArchive = async () => {
    await onArchive?.(counterparty);
  };

  const actions_menu_aria_label = t('actions_menu_aria_label');

  return (
    <>
      <DropdownMenu>
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
