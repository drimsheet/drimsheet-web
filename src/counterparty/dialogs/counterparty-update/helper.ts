import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { isValidUUID } from '@/shared/lib/utils/uuid';
import type { CounterpartyUpdateDialogProps } from './types';

const formRoles = ['default', 'employer', 'contractor', 'vendor'] as const;

function isFormRole(value: string | null): value is (typeof formRoles)[number] {
  return formRoles.some((role) => role === value);
}

function getRole(
  params: URLSearchParams,
  role?: CounterpartyUpdateDialogProps['role']
) {
  if (role) return role;

  const type = params.get('type');

  return isFormRole(type) ? type : 'default';
}

function isOpen(params: URLSearchParams, counterpartyId?: string) {
  if (params.has('edit')) return params.get('edit') === 'true';

  return counterpartyId === undefined && params.has('id');
}

function isValidLink(
  params: URLSearchParams,
  routeId: string | undefined,
  props: Pick<CounterpartyUpdateDialogProps, 'counterpartyId' | 'type'> = {}
) {
  const id = props.counterpartyId ?? params.get('id');
  const propDriven = props.counterpartyId !== undefined;

  if (!isValidUUID(id) || (routeId && id !== routeId)) return false;

  if (!propDriven) return isFormRole(params.get('type'));

  const type = props.type;

  return type === undefined || type === 'individual' || type === 'organization';
}

function normalizeParams(
  params: URLSearchParams,
  counterpartyId: string | undefined,
  party: ICounterpartyDto
) {
  if (counterpartyId === undefined) return params;

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

const counterpartyUpdateHelpers = Object.freeze({
  getRole,
  isOpen,
  isValidLink,
  normalizeParams,
});

export default counterpartyUpdateHelpers;
