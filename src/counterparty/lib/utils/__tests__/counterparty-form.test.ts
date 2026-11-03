import {
  getCounterpartyFormRole,
  hasCounterpartyChanges,
  isCounterpartyTypeConflict,
} from '@/counterparty/lib/utils/counterparty-form';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';

const party: ICounterpartyDto = {
  id: '00000000-0000-4000-8000-000000000100',
  accountingEntityId: 'entity',
  createdBy: 'user',
  name: 'Example',
  type: 'organization',
  status: 'active',
  roles: [],
  roleDetails: {},
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('counterparty form predicates', () => {
  it('selects an existing form for the first recorded role', () => {
    expect(getCounterpartyFormRole(party)).toBe('default');
    for (const role of ['vendor', 'contractor', 'employer'] as const) {
      expect(getCounterpartyFormRole({ ...party, roles: [role] })).toBe(role);
    }

    expect(
      getCounterpartyFormRole({ ...party, roles: ['vendor', 'contractor'] })
    ).toBe('vendor');
    expect(
      getCounterpartyFormRole({
        ...party,
        roleDetails: { vendor: { address: null } },
      })
    ).toBe('vendor');
  });
  it('detects edits and leaves unchanged requests alone', () => {
    expect(hasCounterpartyChanges({})).toBe(false);
    expect(hasCounterpartyChanges({ name: 'Changed' })).toBe(true);
    expect(hasCounterpartyChanges({ roleDetails: {} })).toBe(true);
    expect(
      hasCounterpartyChanges({
        roleDetails: { vendor: { address: null } },
      })
    ).toBe(true);
  });
  it('distinguishes type-use and stale-version conflicts', () => {
    const error = new AxiosError('conflict', undefined, undefined, undefined, {
      status: 409,
      headers: {},
      data: { errorKey: 'repo_error_version_conflict' },
    } as never);

    expect(isCounterpartyTypeConflict(error)).toBe(false);
    error.response!.data = {
      errorKey: 'counterparty_error_type_change_after_transaction_use_conflict',
    };
    expect(isCounterpartyTypeConflict(error)).toBe(true);
    error.response!.data = {
      cause: { field: 'type', reason: 'transaction_usage' },
    };
    expect(isCounterpartyTypeConflict(error)).toBe(true);
  });
});
