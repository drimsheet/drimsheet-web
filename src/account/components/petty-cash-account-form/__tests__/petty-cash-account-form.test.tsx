import { PettyCashAccountForm } from '@/account/components/petty-cash-account-form';
import type { PettyCashAccountFormProps } from '@/account/components/petty-cash-account-form/types';
import type { ICurrencyDto, IExchangeRate } from '@/shared/lib/api/Api';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const currencies: ICurrencyDto[] = [
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    minorUnit: 2,
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    minorUnit: 2,
  },
];

const validInitialValues = {
  name: 'Office petty cash',
  currencyCode: 'NGN',
  openingBalance: 100,
  openingDate: '2026-07-01',
};

const officialExchangeRate = {
  baseCurrencyCode: 'USD',
  targetCurrencyCode: 'NGN',
  rate: 1500,
  asOf: '2026-07-01T00:00:00.000Z',
} as IExchangeRate;

function renderForm(props?: Partial<PettyCashAccountFormProps>) {
  const onSubmit = props?.onSubmit ?? vi.fn();

  const onExchangeRateContextChange =
    props?.onExchangeRateContextChange ?? vi.fn();

  render(
    <PettyCashAccountForm
      accountingCurrencyCode="NGN"
      currencies={currencies}
      onExchangeRateContextChange={onExchangeRateContextChange}
      onSubmit={onSubmit}
      {...props}
    />
  );

  return { onSubmit, onExchangeRateContextChange };
}

describe('PettyCashAccountForm', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.hasPointerCapture = vi.fn(
      () => false
    ) as unknown as typeof window.HTMLElement.prototype.hasPointerCapture;
    window.HTMLElement.prototype.releasePointerCapture =
      vi.fn() as unknown as typeof window.HTMLElement.prototype.releasePointerCapture;
    window.HTMLElement.prototype.setPointerCapture =
      vi.fn() as unknown as typeof window.HTMLElement.prototype.setPointerCapture;
    window.HTMLElement.prototype.scrollIntoView =
      vi.fn() as unknown as typeof window.HTMLElement.prototype.scrollIntoView;
  });

  it('renders the form controls with accessible labels', () => {
    renderForm();

    expect(screen.getByLabelText('Account display name')).toBeInTheDocument();
    expect(screen.getByLabelText('Currency')).toBeInTheDocument();
    expect(screen.getByLabelText('Opening balance')).toBeInTheDocument();
    expect(screen.getByLabelText('Opening date')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Create as a sub account')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create account' })
    ).toBeInTheDocument();
  });

  it('shows required validation errors after an empty submit', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText('Account name is required')
    ).toBeInTheDocument();
    expect(screen.getByText('Currency is required')).toBeInTheDocument();
    expect(screen.getByText('Opening balance is required')).toBeInTheDocument();
    expect(screen.getByText('Opening date is required')).toBeInTheDocument();
  });

  it('disables opening fields when opening without a balance', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(
      screen.getByLabelText('Create without an opening balance')
    );

    expect(screen.getByLabelText('Opening balance')).toBeDisabled();
    expect(screen.getByLabelText('Opening date')).toBeDisabled();
  });

  it('only shows exchange rate for a foreign currency', () => {
    const { rerender } = render(
      <PettyCashAccountForm
        accountingCurrencyCode="NGN"
        currencies={currencies}
        initialValues={{ currencyCode: 'NGN' }}
        onExchangeRateContextChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.queryByLabelText('Exchange rate')).not.toBeInTheDocument();

    rerender(
      <PettyCashAccountForm
        accountingCurrencyCode="NGN"
        currencies={currencies}
        initialValues={{ currencyCode: 'USD' }}
        onExchangeRateContextChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Exchange rate')).toBeInTheDocument();
  });

  it('submits a valid same-currency account', async () => {
    const user = userEvent.setup();

    const { onSubmit } = renderForm({
      initialValues: validInitialValues,
    });

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Office petty cash',
        currencyCode: 'NGN',
        createWithoutOpeningBalance: false,
        openingBalance: 100,
        openingDate: '2026-07-01',
        exchangeRate: null,
        isSubAccount: false,
      })
    );
  });

  it('uses an official exchange rate when no manual rate is entered', async () => {
    const user = userEvent.setup();

    const { onSubmit } = renderForm({
      initialValues: {
        ...validInitialValues,
        currencyCode: 'USD',
      },
      officialExchangeRate,
    });

    expect(screen.getByText(/Official rate:/)).toHaveTextContent(
      'Official rate: 1500'
    );
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ exchangeRate: null })
      )
    );
  });

  it('preserves an inverted foreign-currency rate through submission', async () => {
    const user = userEvent.setup();

    const { onSubmit } = renderForm({
      initialValues: {
        ...validInitialValues,
        currencyCode: 'USD',
        exchangeRate: { value: 1000, inverted: false },
      },
    });

    await user.click(screen.getByRole('button', { name: 'Invert rates' }));
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          exchangeRate: { value: 0.001, inverted: true },
        })
      )
    );
  });

  it('reports foreign currency context and clears it when opening without a balance', async () => {
    const user = userEvent.setup();

    const { onExchangeRateContextChange } = renderForm({
      initialValues: validInitialValues,
    });

    await user.click(screen.getByLabelText('Currency'));
    await user.click(screen.getByRole('option', { name: /US Dollar/i }));

    expect(onExchangeRateContextChange).toHaveBeenLastCalledWith({
      currencyCode: 'USD',
      date: '2026-07-01',
      createWithoutOpeningBalance: false,
    });

    await user.click(
      screen.getByLabelText('Create without an opening balance')
    );

    expect(onExchangeRateContextChange).toHaveBeenLastCalledWith({
      currencyCode: 'USD',
      date: '2026-07-01',
      createWithoutOpeningBalance: true,
    });
  });

  it('submits the selected sub-account state', async () => {
    const user = userEvent.setup();

    const { onSubmit } = renderForm({
      initialValues: validInitialValues,
    });

    await user.click(screen.getByLabelText('Create as a sub account'));
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ isSubAccount: true })
      )
    );
  });

  it('submits form values unchanged when creating without a balance', async () => {
    const user = userEvent.setup();

    const { onSubmit } = renderForm({
      initialValues: {
        ...validInitialValues,
        createWithoutOpeningBalance: true,
        openingBalance: 500,
        openingDate: '2026-07-01',
        exchangeRate: { value: 1500, inverted: false },
        isSubAccount: true,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          createWithoutOpeningBalance: true,
          openingBalance: 500,
          openingDate: '2026-07-01',
          exchangeRate: { value: 1500, inverted: false },
          isSubAccount: true,
        })
      )
    );
  });
});
