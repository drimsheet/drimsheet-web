import type { IAccountingEntity } from '@/shared/lib/api/Api';

export interface LegalEntityListProps {
  entities: IAccountingEntity[];
  currentEntityId?: string;
  getEntityHref: (entity: IAccountingEntity) => string;
}

export interface LegalEntityActionsProps {
  entityName: string;
  isCurrent: boolean;
}
