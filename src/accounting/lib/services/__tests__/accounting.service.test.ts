import { accountingService } from '@/accounting/lib/services/accounting.service';
import { drimsheetApi } from '@/shared/lib/api';
import type {
  IAccountingEntity,
  IAccountingEntityCreationDto,
  IAccountingEntitySwitchReq,
  TEntityId,
} from '@/shared/lib/api/Api';
import type { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/api', () => ({
  drimsheetApi: {
    accounting: {
      createAccountingEntity: vi.fn(),
      getActiveAccountingEntity: vi.fn(),
      getUserAccountingEntities: vi.fn(),
      getJurisdictions: vi.fn(),
      switchAccountingEntity: vi.fn(),
    },
  },
}));

const timestamp = '2026-01-01T00:00:00.000Z';
const firstEntity = {
  id: '00000000-0000-4000-8000-000000000001' as TEntityId,
  name: 'First Account',
  type: 'individual',
  ownerId: '00000000-0000-4000-8000-000000000100' as TEntityId,
  createdBy: '00000000-0000-4000-8000-000000000100' as TEntityId,
  functionalCurrencyCode: 'NGN',
  jurisdictionCode: 'NG',
  createdAt: timestamp,
  updatedAt: timestamp,
} satisfies IAccountingEntity;
const secondEntity = {
  ...firstEntity,
  id: '00000000-0000-4000-8000-000000000002' as TEntityId,
  name: 'Second Account',
} satisfies IAccountingEntity;

function makeResponseError(status: number): AxiosError {
  return {
    isAxiosError: true,
    name: 'AxiosError',
    message: 'Request failed',
    response: {
      status,
      statusText: '',
      headers: {},
      config: { headers: {} as never },
      data: {},
    },
    toJSON: () => ({}),
  } as AxiosError;
}

describe('accountingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accountingService.removeAccountingEntity();
  });

  it('stores the fetched active accounting entity in memory', async () => {
    vi.mocked(
      drimsheetApi.accounting.getActiveAccountingEntity
    ).mockResolvedValue({ data: firstEntity } as never);

    await expect(accountingService.getAccountingEntity()).resolves.toEqual(
      firstEntity
    );
    expect(accountingService.getAccountingEntityId()).toBe(firstEntity.id);
  });

  it('switches to the first available entity when no active entity exists', async () => {
    const notFoundError = makeResponseError(404);
    vi.mocked(
      drimsheetApi.accounting.getActiveAccountingEntity
    ).mockRejectedValue(notFoundError);
    vi.mocked(
      drimsheetApi.accounting.getUserAccountingEntities
    ).mockResolvedValue({ data: [firstEntity, secondEntity] } as never);
    vi.mocked(drimsheetApi.accounting.switchAccountingEntity).mockResolvedValue(
      { data: firstEntity } as never
    );

    await expect(accountingService.getAccountingEntity()).resolves.toEqual(
      firstEntity
    );
    expect(drimsheetApi.accounting.switchAccountingEntity).toHaveBeenCalledWith(
      { accountingEntityId: firstEntity.id }
    );
    expect(accountingService.getAccountingEntityId()).toBe(firstEntity.id);
  });

  it('rethrows a missing active entity error when no entities exist', async () => {
    const notFoundError = makeResponseError(404);
    vi.mocked(
      drimsheetApi.accounting.getActiveAccountingEntity
    ).mockRejectedValue(notFoundError);
    vi.mocked(
      drimsheetApi.accounting.getUserAccountingEntities
    ).mockResolvedValue({ data: [] } as never);

    await expect(accountingService.getAccountingEntity()).rejects.toBe(
      notFoundError
    );
    expect(
      drimsheetApi.accounting.switchAccountingEntity
    ).not.toHaveBeenCalled();
    expect(accountingService.getAccountingEntityId()).toBeUndefined();
  });

  it('rethrows non-404 active entity errors without using the fallback', async () => {
    const serverError = makeResponseError(500);
    vi.mocked(
      drimsheetApi.accounting.getActiveAccountingEntity
    ).mockRejectedValue(serverError);

    await expect(accountingService.getAccountingEntity()).rejects.toBe(
      serverError
    );
    expect(
      drimsheetApi.accounting.getUserAccountingEntities
    ).not.toHaveBeenCalled();
    expect(
      drimsheetApi.accounting.switchAccountingEntity
    ).not.toHaveBeenCalled();
  });

  it('switches and stores the returned accounting entity', async () => {
    const payload = {
      accountingEntityId: secondEntity.id,
    } satisfies IAccountingEntitySwitchReq;
    vi.mocked(drimsheetApi.accounting.switchAccountingEntity).mockResolvedValue(
      { data: secondEntity } as never
    );

    await expect(
      accountingService.switchAccountingEntity(payload)
    ).resolves.toEqual(secondEntity);
    expect(drimsheetApi.accounting.switchAccountingEntity).toHaveBeenCalledWith(
      payload
    );
    expect(accountingService.getAccountingEntityId()).toBe(secondEntity.id);
  });

  it('stores the active entity temporarily when preparing to reload', async () => {
    vi.mocked(
      drimsheetApi.accounting.getActiveAccountingEntity
    ).mockResolvedValue({ data: firstEntity } as never);
    await accountingService.getAccountingEntity();

    accountingService.prepareAccountingEntityReload();

    expect(localStorage.getItem('accounting-entity-id')).toBe(firstEntity.id);
  });

  it('keeps the current entity when switching fails', async () => {
    vi.mocked(
      drimsheetApi.accounting.getActiveAccountingEntity
    ).mockResolvedValue({ data: firstEntity } as never);
    vi.mocked(drimsheetApi.accounting.switchAccountingEntity).mockRejectedValue(
      new Error('Switch failed')
    );
    await accountingService.getAccountingEntity();

    await expect(
      accountingService.switchAccountingEntity({
        accountingEntityId: secondEntity.id,
      })
    ).rejects.toThrow('Switch failed');
    expect(accountingService.getAccountingEntityId()).toBe(firstEntity.id);
  });

  it('does not select an entity when listing available entities', async () => {
    vi.mocked(
      drimsheetApi.accounting.getUserAccountingEntities
    ).mockResolvedValue({ data: [firstEntity, secondEntity] } as never);

    await expect(accountingService.getAccountingEntities()).resolves.toEqual([
      firstEntity,
      secondEntity,
    ]);
    expect(accountingService.getAccountingEntityId()).toBeUndefined();
  });

  it('stores a newly created accounting entity in memory', async () => {
    const payload = {} as IAccountingEntityCreationDto;
    vi.mocked(drimsheetApi.accounting.createAccountingEntity).mockResolvedValue(
      { data: firstEntity } as never
    );

    await expect(
      accountingService.createAccountingEntity(payload)
    ).resolves.toEqual(firstEntity);
    expect(drimsheetApi.accounting.createAccountingEntity).toHaveBeenCalledWith(
      payload
    );
    expect(accountingService.getAccountingEntityId()).toBe(firstEntity.id);
  });
});
