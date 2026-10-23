import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { ArrowLeftRight, Ellipsis, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LegalEntityActionsProps } from '../types';

export function LegalEntityActions({
  entityName,
  isCurrent,
}: Readonly<LegalEntityActionsProps>) {
  const { t } = useTranslation('accounting');
  const actions_label = t('legal_entities_actions_label', { name: entityName });
  const switch_label = t('legal_entities_switch_label');
  const edit_label = t('legal_entities_edit_label');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label={actions_label}
        >
          <Ellipsis aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          {!isCurrent && (
            <DropdownMenuItem disabled>
              <ArrowLeftRight aria-hidden />
              {switch_label}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem disabled>
            <Pencil aria-hidden />
            {edit_label}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
