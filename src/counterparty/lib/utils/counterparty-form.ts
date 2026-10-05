import { parseApiError } from '@/shared/lib/api';
import type {
  ICounterpartyDto,
  ICounterpartyUpdateReq,
  UCounterpartyRole,
} from '@/shared/lib/api/Api';

export function getCounterpartyFormRole(
  party: ICounterpartyDto
): UCounterpartyRole | 'default' {
  return (
    party.roles[0] ??
    (['employer', 'vendor', 'contractor'] as const).find((role) =>
      Boolean(party.meta[role])
    ) ??
    'default'
  );
}

export function hasCounterpartyChanges(request: ICounterpartyUpdateReq) {
  return (
    request.name !== undefined ||
    request.type !== undefined ||
    request.meta !== undefined
  );
}

export function isCounterpartyTypeConflict(value: unknown) {
  const error = parseApiError(value);

  return (
    error.code === 409 &&
    (error.errorKey ===
      'counterparty_error_type_change_after_transaction_use_conflict' ||
      (error.cause?.field === 'type' &&
        error.cause?.reason === 'transaction_usage'))
  );
}
