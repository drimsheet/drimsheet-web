import {
  CashTransferForm,
  createCashTransferFormValidation,
  type CashTransferFormProps,
  type ICashTransferFormValidationMessages,
} from '@/journal-entries/components/cash-transfer-form';
import type { ILedgerAccountDto } from '@/shared/lib/api/Api';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const sourceAccounts = [
  {
    id: 'source-bank',
    code: '1000',
    name: 'Operating account',
    type: 'asset',
    subType: 'cash_and_cash_equivalent',
    openingBalanceDate: '2026-08-01',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
  {
    id: 'source-usd',
    code: '1001',
    name: 'USD account',
    type: 'asset',
    subType: 'cash_and_cash_equivalent',
    openingBalanceDate: '2026-08-01',
    balance: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
  },
] as ILedgerAccountDto[];

const destinationAccounts = [
  {
    id: 'destination-cash',
    code: '1010',
    name: 'Petty cash',
    type: 'asset',
    subType: 'cash_and_cash_equivalent',
    openingBalanceDate: '2026-08-02',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
  {
    id: 'destination-usd',
    code: '1020',
    name: 'USD account',
    type: 'asset',
    subType: 'cash_and_cash_equivalent',
    openingBalanceDate: '2026-08-02',
    balance: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
  },
] as ILedgerAccountDto[];

const categories = [
  {
    id: 'bank-fees',
    code: '6000',
    name: 'Bank fees',
    type: 'expense',
    subType: 'bank_charge',
    openingBalanceDate: '2026-08-01',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
] as ILedgerAccountDto[];

const messages: ICashTransferFormValidationMessages = {
  sourceAccountRequired: 'Source account is required',
  destinationAccountRequired: 'Destination account is required',
  accountsDifferent: 'Accounts must differ',
  amountSentPositive: 'Amount sent must be positive',
  amountSentRequired: 'Amount sent is required',
  amountReceivedPositive: 'Amount received must be positive',
  amountReceivedRequired: 'Amount received is required',
  amountsUnbalanced: 'Amounts must balance',
  dateBeforeAccountOpening: 'Date is before account opening',
  dateFuture: 'Date is in the future',
  dateRequired: 'Date is required',
  exchangeRateNumber: 'Rate must be numeric',
  exchangeRatePositive: 'Rate must be positive',
  exchangeRateRequired: 'Rate is required',
  itemAmountPositive: 'Fee must be positive',
  itemAmountRequired: 'Fee is required',
  itemCategoryRequired: 'Fee category is required',
  itemsRequired: 'Fees are required',
  attachmentSize: 'Attachment is too large',
  attachmentType: 'Attachment type is invalid',
};

const defaultInitialValues: CashTransferFormProps['initialValues'] = {
  sourceAccountId: 'source-bank',
  destinationAccountId: 'destination-cash',
  amountSent: { amount: 100 },
  amountReceived: { amount: 100 },
  date: '2026-08-30',
};

function renderForm(overrides: Partial<CashTransferFormProps> = {}) {
  const onSubmit = vi.fn();
  const onCurrencyContextChange = vi.fn();

  render(
    <CashTransferForm
      sourceAccounts={sourceAccounts}
      destinationAccounts={destinationAccounts}
      categories={categories}
      functionalCurrencyCode="NGN"
      initialValues={defaultInitialValues}
      onCurrencyContextChange={onCurrencyContextChange}
      onSubmit={onSubmit}
      {...overrides}
    />
  );

  return { onCurrencyContextChange, onSubmit };
}

describe('CashTransferForm validation', () => {
  const schema = createCashTransferFormValidation(
    sourceAccounts,
    destinationAccounts,
    messages
  );

  it('accepts balanced same-currency values with charges', async () => {
    await expect(
      schema.validate({
        sourceAccountId: 'source-bank',
        destinationAccountId: 'destination-cash',
        amountSent: { amount: 105, currencyCode: 'NGN', isMinorUnit: false },
        amountReceived: {
          amount: 100,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        date: '2026-08-30',
        exchangeRate: null,
        isItemized: true,
        items: [
          {
            id: 'fee-1',
            amount: { amount: 5, currencyCode: 'NGN', isMinorUnit: false },
            accountId: 'bank-fees',
            description: '',
          },
        ],
        description: '',
        attachment: null,
      })
    ).resolves.toBeDefined();
  });

  it('rejects unbalanced same-currency values', async () => {
    await expect(
      schema.validate({
        sourceAccountId: 'source-bank',
        destinationAccountId: 'destination-cash',
        amountSent: { amount: 105, currencyCode: 'NGN', isMinorUnit: false },
        amountReceived: {
          amount: 99,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        date: '2026-08-30',
        exchangeRate: null,
        isItemized: false,
        items: [],
        description: '',
        attachment: null,
      })
    ).rejects.toThrow('Amounts must balance');
  });

  it('accepts charge-inclusive forex values using source-to-destination rate', async () => {
    await expect(
      schema.validate({
        sourceAccountId: 'source-usd',
        destinationAccountId: 'destination-cash',
        amountSent: {
          amount: 105,
          currencyCode: 'USD',
          isMinorUnit: false,
        },
        amountReceived: {
          amount: 100000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        date: '2026-08-30',
        exchangeRate: { value: 1000, inverted: false },
        isItemized: true,
        items: [
          {
            id: 'fee-1',
            amount: { amount: 5000, currencyCode: 'NGN', isMinorUnit: false },
            accountId: 'bank-fees',
            description: '',
          },
        ],
        description: '',
        attachment: null,
      })
    ).resolves.toBeDefined();
  });

  it('rejects identical accounts and dates before either opening date', async () => {
    await expect(
      schema.validate({
        sourceAccountId: 'destination-cash',
        destinationAccountId: 'destination-cash',
        amountSent: { amount: 100, currencyCode: 'NGN', isMinorUnit: false },
        amountReceived: {
          amount: 100,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        date: '2026-08-01',
        exchangeRate: null,
        isItemized: false,
        items: [],
        description: '',
        attachment: null,
      })
    ).rejects.toThrow();
  });
});

describe('CashTransferForm', () => {
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

  it('renders the requested single-entry transfer fields', () => {
    renderForm();

    expect(screen.getByLabelText('Source account')).toBeInTheDocument();
    expect(screen.getByLabelText('Destination account')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount sent')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount received')).toBeInTheDocument();
    expect(screen.queryByLabelText('Exchange rate')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add charges or fees' })
    ).toBeInTheDocument();
  });

  it('tracks amount sent without allowing amount received to rewrite it', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.clear(screen.getByLabelText('Amount sent'));
    await user.type(screen.getByLabelText('Amount sent'), '250');
    expect(screen.getByLabelText('Amount received')).toHaveValue('250');

    await user.clear(screen.getByLabelText('Amount received'));
    await user.type(screen.getByLabelText('Amount received'), '200');
    expect(screen.getByLabelText('Amount sent')).toHaveValue('250');
  });

  it('updates received amount from forex rate and rate from received amount', async () => {
    const user = userEvent.setup();
    renderForm({
      initialValues: {
        sourceAccountId: 'source-usd',
        destinationAccountId: 'destination-cash',
        amountSent: { amount: 100 },
        amountReceived: { amount: 150000 },
        exchangeRate: { value: 1500, inverted: false },
        date: '2026-08-30',
      },
    });

    await user.clear(screen.getByLabelText('Exchange rate'));
    await user.type(screen.getByLabelText('Exchange rate'), '1000');
    expect(screen.getByLabelText('Amount received')).toHaveValue('100,000');

    await user.clear(screen.getByLabelText('Amount received'));
    await user.type(screen.getByLabelText('Amount received'), '125000');
    expect(screen.getByLabelText('Exchange rate')).toHaveValue('1,250');
    expect(screen.getByLabelText('Amount sent')).toHaveValue('100');
  });

  it('forms the exchange rate as source currency over destination currency', () => {
    renderForm({
      initialValues: {
        sourceAccountId: 'source-usd',
        destinationAccountId: 'destination-cash',
        amountSent: { amount: 100 },
        exchangeRate: { value: 1233, inverted: false },
        date: '2026-08-30',
      },
    });

    expect(screen.getByLabelText('USD base amount')).toBeInTheDocument();
    expect(
      screen
        .getByLabelText('Exchange rate')
        .closest('[data-slot="input-group"]')
    ).toHaveTextContent('NGN');
    expect(screen.getByLabelText('Amount received')).toHaveValue('123,300');
  });

  it('preserves an inverted transfer rate through submission', async () => {
    const user = userEvent.setup();

    const { onSubmit } = renderForm({
      initialValues: {
        sourceAccountId: 'source-usd',
        destinationAccountId: 'destination-cash',
        amountSent: { amount: 100 },
        amountReceived: { amount: 100000 },
        exchangeRate: { value: 1000, inverted: false },
        date: '2026-08-30',
      },
    });

    await user.click(screen.getByRole('button', { name: 'Invert rates' }));

    expect(screen.getByLabelText('Exchange rate')).toHaveValue('0.001');
    expect(screen.getByLabelText('Amount received')).toHaveValue('100,000');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          exchangeRate: { value: 0.001, inverted: true },
        })
      )
    );
  });

  it('uses the dedicated categories prop for charge rows', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(
      screen.getByRole('button', { name: 'Add charges or fees' })
    );
    await user.click(screen.getByRole('combobox', { name: 'Category' }));

    expect(
      screen.getByRole('option', { name: 'Bank fees' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Petty cash' })
    ).not.toBeInTheDocument();
  });

  it('submits normalized sent and received values', async () => {
    const user = userEvent.setup();

    const { onSubmit } = renderForm({
      initialValues: {
        ...defaultInitialValues,
        description: ' Transfer ',
      },
    });

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAccountId: 'source-bank',
        destinationAccountId: 'destination-cash',
        amountSent: {
          amount: 100,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        amountReceived: {
          amount: 100,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        description: 'Transfer',
        items: [],
      })
    );
  });

  it('opens the charge editor and blocks create while its row is incomplete', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(
      screen.getByRole('button', { name: 'Add charges or fees' })
    );

    expect(
      screen.getByRole('button', { name: 'Back to single entry' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('emits normalized values through the draft action', async () => {
    const user = userEvent.setup();
    const onSaveDraft = vi.fn();
    const onSubmit = vi.fn();
    renderForm({
      initialValues: {
        ...defaultInitialValues,
        description: ' Draft transfer ',
      },
      onSaveDraft,
      onSubmit,
    });

    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() => expect(onSaveDraft).toHaveBeenCalledOnce());
    expect(onSaveDraft).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Draft transfer' })
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
