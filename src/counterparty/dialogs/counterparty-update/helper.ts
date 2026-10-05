import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { isValidUUID } from '@/shared/lib/utils/uuid';
import type { CounterpartyUpdateDialogProps } from './types';

function isOpen(params: URLSearchParams, counterpartyId?: string) {
  if (params.has('edit')) return params.get('edit') === 'true';

  return (
    counterpartyId === undefined &&
    (params.has('id') ||
      params.has('type') ||
      params.has('editCounterpartyRole'))
  );
}

function isValidLink(
  params: URLSearchParams,
  routeId: string | undefined,
  props: Pick<CounterpartyUpdateDialogProps, 'counterpartyId' | 'type'> = {}
) {
  const id = props.counterpartyId ?? params.get('id');
  const type = props.type ?? params.get('type');

  const role =
    props.counterpartyId === undefined
      ? params.get('editCounterpartyRole')
      : null;

  return (
    isValidUUID(id) &&
    (!routeId || id === routeId) &&
    (!type || type === 'individual' || type === 'organization') &&
    (!role || ['default', 'employer', 'contractor', 'vendor'].includes(role))
  );
}

function normalizeParams(
  params: URLSearchParams,
  counterpartyId: string | undefined,
  party: ICounterpartyDto
) {
  if (counterpartyId !== undefined) {
    if (params.get('edit') !== 'true' || counterpartyId !== party.id)
      return params;

    if (
      !params.has('id') &&
      !params.has('type') &&
      !params.has('editCounterpartyRole')
    )
      return params;

    const next = new URLSearchParams(params);
    next.delete('id');
    next.delete('type');
    next.delete('editCounterpartyRole');

    return next;
  }

  if (params.get('id') !== party.id) return params;

  if (params.get('type') === party.type && !params.has('editCounterpartyRole'))
    return params;

  const next = new URLSearchParams(params);
  next.set('type', party.type);
  next.delete('editCounterpartyRole');

  return next;
}

const counterpartyUpdateHelpers = Object.freeze({
  isOpen,
  isValidLink,
  normalizeParams,
});

export default counterpartyUpdateHelpers;
