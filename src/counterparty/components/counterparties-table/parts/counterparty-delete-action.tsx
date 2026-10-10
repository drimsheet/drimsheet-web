import { DropdownMenuItem } from '@/shared/components/dropdown-menu';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CounterpartyDeleteActionProps {
  onSelect: () => void;
}

export function CounterpartyDeleteAction({
  onSelect,
}: Readonly<CounterpartyDeleteActionProps>) {
  const { t } = useTranslation('counterparty');
  const delete_label = t('delete_label');

  return (
    <DropdownMenuItem onSelect={onSelect} variant="destructive">
      <Trash2 aria-hidden="true" />
      {delete_label}
    </DropdownMenuItem>
  );
}
