import { PettyCashAccountFormUpdateContainer } from '@/account/components/petty-cash-account-form';
import { useUpdatePettyCashAccount } from '@/account/hooks/use-update-petty-cash-account';
import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import type { ILedgerAccountDto, TEntityId } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/account/hooks/use-update-petty-cash-account');
vi.mock('@/shared/hooks/use-api-error-handler');
vi.mock('@/account/hooks/use-account-update-exchange-rate', () => ({
  useAccountUpdateExchangeRate: () => ({
    onExchangeRateContextChange: () => undefined,
  }),
}));
vi.mock('@/shared/hooks/use-currencies', () => ({
  useCurrencies: () => ({
    data: [{ code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 }],
    isPending: false,
  }),
}));
vi.mock('@/account/lib/services/ledger-account.service', () => ({
  ledgerAccountService: {
    getOpeningBalance: vi.fn(),
    getBankDetails: vi.fn(),
    getLedgerAccountCurrencyUpdateEligibility: vi.fn(),
  },
}));

const account: ILedgerAccountDto = {
  id: 'account-1' as TEntityId,
  code: '100001',
  materializedPath: '100001',
  accountingEntityId: 'entity-1' as TEntityId,
  type: 'asset',
  normalBalance: 'debit',
  subType: 'cash_and_cash_equivalent',
  behavior: 'petty_cash',
  isControlAccount: false,
  name: 'Operating account',
  status: 'active',
  contraAccountRule: 'contra_permitted',
  adjunctAccountRule: 'adjunct_permitted',
  openingBalanceDate: '2026-10-01T00:00:00Z',
  createdBy: 'user-1' as TEntityId,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
  balance: { amount: 12345, currencyCode: 'NGN', isMinorUnit: true },
  functionalBalance: {
    amount: 123450,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
};

function renderContainer(
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
) {
  const onSuccess = vi.fn();

  const view = render(
    <QueryClientProvider client={client}>
      <PettyCashAccountFormUpdateContainer
        account={account}
        onSuccess={onSuccess}
        onCancel={vi.fn()}
        onBusyChange={vi.fn()}
      />
    </QueryClientProvider>
  );

  return { ...view, client, onSuccess };
}

describe('PettyCashAccountFormUpdateContainer', () => {
  const mutateAsync = vi.fn();
  const handleError = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    mutateAsync.mockResolvedValue(undefined);
    vi.mocked(useUpdatePettyCashAccount).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    vi.mocked(useApiErrorHandler).mockReturnValue(handleError);
    vi.mocked(ledgerAccountService.getOpeningBalance).mockResolvedValue(null);
    vi.mocked(
      ledgerAccountService.getLedgerAccountCurrencyUpdateEligibility
    ).mockResolvedValue({ canUpdateCurrency: true });
    vi.mocked(ledgerAccountService.getBankDetails).mockResolvedValue({
      countryCode: 'NG',
      bankName: 'Example Bank',
      accountName: 'Acme',
      accountNumber: '0123456789',
    });
  });

  it('fails closed when the opening balance cannot be read', async () => {
    vi.mocked(ledgerAccountService.getOpeningBalance).mockRejectedValue(
      new Error('unavailable')
    );
    renderContainer();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load the opening balance'
    );
    expect(
      screen.queryByRole('button', { name: 'Save changes' })
    ).not.toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('locks a loaded zero opening balance and omits it from a rename request', async () => {
    const user = userEvent.setup();
    vi.mocked(ledgerAccountService.getOpeningBalance).mockResolvedValue({
      amount: { amount: 0, currencyCode: 'NGN', isMinorUnit: true },
      date: '2026-10-01T00:00:00Z',
      exchangeRate: null,
    });
    const { onSuccess } = renderContainer();
    expect(
      await screen.findByLabelText('Opening balance', { exact: true })
    ).toHaveValue('0');
    expect(
      screen.getByLabelText('Opening balance', { exact: true })
    ).toBeDisabled();
    expect(
      screen.getByLabelText('Opening date', { exact: true })
    ).toBeDisabled();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    await user.clear(screen.getByLabelText('Account display name'));
    await user.type(
      screen.getByLabelText('Account display name'),
      'Renamed account'
    );
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(mutateAsync).toHaveBeenCalledExactlyOnceWith({
      name: 'Renamed account',
      currencyCode: undefined,
      openingBalance: undefined,
    });
  });

  it('fails closed when currency eligibility cannot be read', async () => {
    vi.mocked(
      ledgerAccountService.getLedgerAccountCurrencyUpdateEligibility
    ).mockRejectedValue(new Error('unavailable'));
    renderContainer();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to check whether the currency can be updated'
    );
    expect(
      screen.queryByRole('button', { name: 'Save changes' })
    ).not.toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('waits for fresh eligibility on remount before exposing controls and locks an ineligible currency', async () => {
    const user = userEvent.setup();
    const first = renderContainer();
    expect(
      await screen.findByRole('combobox', { name: 'Currency' })
    ).toBeEnabled();
    first.unmount();

    let finishRead!: (value: {
      canUpdateCurrency: false;
      reason: 'has_posted_journal_entries';
    }) => void;

    vi.mocked(
      ledgerAccountService.getLedgerAccountCurrencyUpdateEligibility
    ).mockReturnValue(
      new Promise((resolve) => {
        finishRead = resolve;
      })
    );
    const second = renderContainer(first.client);
    await waitFor(() =>
      expect(
        ledgerAccountService.getLedgerAccountCurrencyUpdateEligibility
      ).toHaveBeenCalledTimes(2)
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Currency' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Save changes' })
    ).not.toBeInTheDocument();
    finishRead({
      canUpdateCurrency: false,
      reason: 'has_posted_journal_entries',
    });
    expect(
      await screen.findByLabelText('Currency', { exact: true })
    ).toHaveAttribute('readonly');
    await user.click(
      screen.getByRole('checkbox', { name: 'Leave opening balance unset' })
    );
    await user.clear(screen.getByLabelText('Account display name'));
    await user.type(
      screen.getByLabelText('Account display name'),
      'Renamed account'
    );
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(second.onSuccess).toHaveBeenCalledOnce());
    expect(mutateAsync).toHaveBeenCalledExactlyOnceWith({
      name: 'Renamed account',
      currencyCode: undefined,
      openingBalance: undefined,
    });
  });

  it('retains the submitted name and reports a settled update failure without completing', async () => {
    const user = userEvent.setup();
    const error = new Error('update failed');
    mutateAsync.mockRejectedValue(error);
    const { onSuccess } = renderContainer();
    await user.clear(await screen.findByLabelText('Account display name'));
    await user.type(
      screen.getByLabelText('Account display name'),
      'Unsaved account'
    );
    await user.click(
      screen.getByRole('checkbox', { name: 'Leave opening balance unset' })
    );
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(handleError).toHaveBeenCalledWith(error, { showToast: true })
    );
    expect(screen.getByLabelText('Account display name')).toHaveValue(
      'Unsaved account'
    );
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
