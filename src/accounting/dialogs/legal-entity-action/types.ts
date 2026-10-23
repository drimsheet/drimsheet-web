import type { IAccountingEntity } from '@/shared/lib/api/Api';

export type ULegalEntityAction = 'edit' | 'archive' | 'delete';
export interface LegalEntityActionDialogProps {
  action: ULegalEntityAction;
  entity: IAccountingEntity;
  isCurrent: boolean;
  onClose: () => void;
  onCloseAutoFocus: (event: Event) => void;
}
