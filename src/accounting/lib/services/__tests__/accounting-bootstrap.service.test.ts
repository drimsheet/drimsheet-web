import { accountingBootstrapService as service } from '@/accounting/lib/services/accounting-bootstrap.service';
import { drimsheetApi } from '@/shared/lib/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/shared/lib/api', () => ({
  drimsheetApi: {
    ledger: {
      setupHeaderAccounts: vi.fn(),
      getRecommendedBootstrap: vi.fn(),
      createStatutoryReceivableAccount: vi.fn(),
      createStatutoryPayableAccount: vi.fn(),
      createRevenueAccount: vi.fn(),
      createExpenseAccount: vi.fn(),
      createSuspenseAccount: vi.fn(),
    },
  },
}));
describe('accountingBootstrapService', () => {
  beforeEach(() => vi.clearAllMocks());

  const calls = [
    [
      service.setupHeaders,
      drimsheetApi.ledger.setupHeaderAccounts,
      { services: 'Services' },
    ],
    [
      service.createReceivable,
      drimsheetApi.ledger.createStatutoryReceivableAccount,
      { name: 'Tax', isControlAccount: false, currencyCode: 'NGN' },
    ],
    [
      service.createPayable,
      drimsheetApi.ledger.createStatutoryPayableAccount,
      { name: 'Tax', isControlAccount: false, currencyCode: 'NGN', meta: null },
    ],
    [
      service.createRevenue,
      drimsheetApi.ledger.createRevenueAccount,
      {
        name: 'Salary',
        isControlAccount: false,
        behavior: 'employment_income',
      },
    ],
    [
      service.createExpense,
      drimsheetApi.ledger.createExpenseAccount,
      { name: 'Rent', isControlAccount: false, behavior: 'rent_and_utilities' },
    ],
    [
      service.createSuspense,
      drimsheetApi.ledger.createSuspenseAccount,
      { name: 'Suspense', type: 'asset', currencyCode: 'NGN' },
    ],
  ] as const;

  it('fetches the recommendation catalog and returns response data', async () => {
    vi.mocked(drimsheetApi.ledger.getRecommendedBootstrap).mockResolvedValue({
      data: { catalog: true },
    } as never);
    expect(await service.getRecommendations()).toEqual({ catalog: true });
    expect(drimsheetApi.ledger.getRecommendedBootstrap).toHaveBeenCalledWith();
  });
  it.each(calls)(
    'delegates unchanged DTOs and returns response data (%#)',
    async (call, api, payload) => {
      vi.mocked(api).mockResolvedValue({ data: { id: 'account' } } as never);
      // The table intentionally groups distinct generated DTO signatures at their transport boundary.
      const invoke = call as (dto: typeof payload) => Promise<unknown>;
      expect(await invoke(payload)).toEqual({ id: 'account' });
      expect(api).toHaveBeenCalledWith(payload);
      expect(vi.mocked(api).mock.calls[0][0]).toBe(payload);
    }
  );
  it('propagates a server error unchanged', async () => {
    const error = new Error('API failed');
    vi.mocked(drimsheetApi.ledger.getRecommendedBootstrap).mockRejectedValue(
      error
    );
    await expect(service.getRecommendations()).rejects.toBe(error);
  });
});
