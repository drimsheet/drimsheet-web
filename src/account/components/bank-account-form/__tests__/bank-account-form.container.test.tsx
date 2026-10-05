import { BankAccountFormContainer } from '@/account/components/bank-account-form';
import * as useGetBankByCountryModule from '@/account/hooks/use-get-bank-by-country';
import type { IExchangeRate } from '@/shared/lib/api/Api';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/account/hooks/use-get-bank-by-country', () => ({
  useGetBankByCountry: vi.fn(),
}));

describe('BankAccountFormContainer', () => {
  it('triggers bank query with initial jurisdiction', () => {
    const useGetBankByCountrySpy = vi.spyOn(
      useGetBankByCountryModule,
      'useGetBankByCountry'
    );

    useGetBankByCountrySpy.mockReturnValue({
      data: [{ bankCode: 'GTB', bankName: 'Guaranty Trust Bank' }],
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<
      typeof useGetBankByCountryModule.useGetBankByCountry
    >);

    render(
      <BankAccountFormContainer
        accountingCurrencyCode="NGN"
        bankLocations={[
          { code: 'NG', name: 'Nigeria' },
          { code: 'US', name: 'United States' },
        ]}
        currencies={[{ code: 'NGN', name: 'Naira', symbol: '₦', minorUnit: 2 }]}
        initialBankLocation="NG"
        initialValues={{ currencyCode: 'NGN', bankLocation: 'NG' }}
        onExchangeRateContextChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(useGetBankByCountrySpy).toHaveBeenCalledWith('NG');
  });

  it('updates bank query location while retaining entered account name in form state', async () => {
    const user = userEvent.setup();

    const useGetBankByCountrySpy = vi.spyOn(
      useGetBankByCountryModule,
      'useGetBankByCountry'
    );

    useGetBankByCountrySpy.mockReturnValue({
      data: [],
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<
      typeof useGetBankByCountryModule.useGetBankByCountry
    >);

    render(
      <BankAccountFormContainer
        accountingCurrencyCode="NGN"
        bankLocations={[
          { code: 'NG', name: 'Nigeria' },
          { code: 'US', name: 'United States' },
        ]}
        currencies={[{ code: 'NGN', name: 'Naira', symbol: '₦', minorUnit: 2 }]}
        initialBankLocation="NG"
        initialValues={{ currencyCode: 'NGN', bankLocation: 'NG' }}
        onExchangeRateContextChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const nameInput = screen.getByLabelText('Account display name');
    await user.type(nameInput, 'My Operating Account');

    const locationInput = screen.getByPlaceholderText('Select a country');
    await user.click(locationInput);

    const usOption = await screen.findByRole('option', {
      name: /United States/i,
    });

    await user.click(usOption);

    expect(useGetBankByCountrySpy).toHaveBeenLastCalledWith('US');
    expect(nameInput).toHaveValue('My Operating Account');
  });

  it('supplies an official rate provided by its user', () => {
    vi.mocked(useGetBankByCountryModule.useGetBankByCountry).mockReturnValue({
      data: [],
      isPending: false,
    } as unknown as ReturnType<
      typeof useGetBankByCountryModule.useGetBankByCountry
    >);
    const officialExchangeRate = { rate: 1500 } as IExchangeRate;

    render(
      <BankAccountFormContainer
        accountingCurrencyCode="NGN"
        bankLocations={[]}
        currencies={[]}
        initialValues={{
          currencyCode: 'USD',
          openingDate: '2026-07-01',
        }}
        officialExchangeRate={officialExchangeRate}
        onExchangeRateContextChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText(/Official rate:/)).toHaveTextContent(
      'Official rate: 1500'
    );
  });

  it('submits bank-account form values unchanged', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    vi.mocked(useGetBankByCountryModule.useGetBankByCountry).mockReturnValue({
      data: [],
      isPending: false,
    } as unknown as ReturnType<
      typeof useGetBankByCountryModule.useGetBankByCountry
    >);

    render(
      <BankAccountFormContainer
        accountingCurrencyCode="NGN"
        bankLocations={[{ code: 'NG', name: 'Nigeria' }]}
        currencies={[{ code: 'NGN', name: 'Naira', symbol: '₦', minorUnit: 2 }]}
        initialValues={{
          name: 'Operating Account',
          currencyCode: 'NGN',
          bankLocation: 'NG',
          bankName: 'Guaranty Trust Bank',
          accountNumber: '0123456789',
          accountName: 'Acme Ltd',
          createWithoutOpeningBalance: true,
        }}
        onExchangeRateContextChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Operating Account',
        currencyCode: 'NGN',
        bankLocation: 'NG',
        bankName: 'Guaranty Trust Bank',
        accountNumber: '0123456789',
        accountName: 'Acme Ltd',
        createWithoutOpeningBalance: true,
        openingBalance: '',
        openingDate: '',
        exchangeRate: null,
        isSubAccount: false,
      })
    );
  });
});
