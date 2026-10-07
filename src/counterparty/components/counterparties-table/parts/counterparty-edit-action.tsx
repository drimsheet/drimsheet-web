import { DropdownMenuItem } from '@/shared/components/dropdown-menu';
import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CounterpartyEditActionProps {
  disabled?: boolean;
  onSelect: () => void;
}

export function CounterpartyEditAction({
  disabled = false,
  onSelect,
}: Readonly<CounterpartyEditActionProps>) {
  const { t } = useTranslation('counterparty');
  const edit_label = t('edit_label');

  return (
    <DropdownMenuItem disabled={disabled} onSelect={onSelect}>
      <Pencil aria-hidden="true" />
      {edit_label}
    </DropdownMenuItem>
  );
}
