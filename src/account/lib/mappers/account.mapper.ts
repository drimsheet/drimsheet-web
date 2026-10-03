import type { TStatusBadgeValue } from '@/shared/components/status-badge';
import {
  ELedgerAccountStatus,
  type ULedgerAccountStatus,
} from '@/shared/lib/api/Api';
import { t } from 'i18next';

function mapStatusToBadgeProps(
  status: ULedgerAccountStatus
): TStatusBadgeValue {
  switch (status) {
    case ELedgerAccountStatus.Draft:
      return { variant: 'neutral', label: t('shared:draft') };
    case ELedgerAccountStatus.Active:
      return { variant: 'success', label: t('shared:active') };
    case ELedgerAccountStatus.Archived:
      return { variant: 'neutral', label: t('shared:archived') };
  }
}

export const ledgerAccountMapper = Object.freeze({
  mapStatusToBadgeProps,
});
