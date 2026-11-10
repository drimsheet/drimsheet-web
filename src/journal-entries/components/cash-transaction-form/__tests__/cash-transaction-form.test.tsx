import {
  CashTransactionForm,
  createCashTransactionFormValidation,
  type ICashTransactionFormValidationMessages,
  type ICashTransactionFormValues,
  type UCashTransactionFormVariant,
} from '@/journal-entries/components/cash-transaction-form';
import type { IExchangeRate, ILedgerAccountDto } from '@/shared/lib/api/Api';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const accounts = [
  {
    id: 'ngn-bank',
    code: '1000',
    name: 'NGN bank account',
    type: 'asset',
    openingBalanceDate: '2026-08-08',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
  {
    id: 'usd-bank',
    code: '1010',
    name: 'USD bank account',
    type: 'asset',
    openingBalanceDate: '2026-08-01',
    balance: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
  },
] as unknown as ILedgerAccountDto[];

const categories = [
  {
    id: 'sales',
    code: '4000',
    name: 'Sales revenue',
    type: 'revenue',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
  {
    id: 'services',
    code: '4100',
    name: 'Professional services',
    type: 'revenue',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
] as unknown as ILedgerAccountDto[];

const validationMessages: ICashTransactionFormValidationMessages = {
  accountRequired: 'Account is required',
  amountPositive: 'Amount must be greater than zero',
  amountRequired: 'Amount is required',
  categoryRequired: 'Category is required',
  dateBeforeAccountOpening: 'Date cannot be before the account opening date',
  dateFuture: 'Date cannot be in the future',
  dateRequired: 'Date is required',
  exchangeRateNumber: 'Exchange rate must be a number',
  exchangeRatePositive: 'Exchange rate must be greater than zero',
  exchangeRateRequired: 'Exchange rate is required',
  itemAmountPositive: 'Item amount must be greater than zero',
  itemAmountRequired: 'Item amount is required',
  itemCategoryRequired: 'Item category is required',
  itemsRequired: 'Add at least one item',
  counterpartyRequired: 'Person or business is required',
  attachmentCount: 'Attach up to 3 files',
  attachmentSize: 'Each attachment must be no larger than 5 MB',
  attachmentType: 'Attachment must be a JPEG, PNG, or PDF',
};

const validValues: ICashTransactionFormValues = {
  accountId: 'ngn-bank',
  categoryId: 'sales',
  amount: { amount: 250, currencyCode: 'NGN', isMinorUnit: false },
  date: '2026-08-10',
  exchangeRate: null,
  isItemized: false,
  items: [],
  counterparty: { id: 'counterparty-1', name: 'Counterparty' },
  description: '',
  attachments: [],
};

describe('CashTransactionForm validation', () => {
  const schema = createCashTransactionFormValidation(
    accounts,
    'NGN',
    validationMessages
  );

  it('uses item amounts as authoritative while itemized', async () => {
    await expect(
      schema.validate({
        ...validValues,
        amount: {
          amount: Number.NaN,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        isItemized: true,
        items: [
          {
            id: 'item-1',
            amount: { amount: 100, currencyCode: 'NGN', isMinorUnit: false },
            accountId: 'sales',
            description: '',
          },
        ],
      })
    ).resolves.toBeTruthy();
  });

  it('rejects unsupported and oversized attachment files', async () => {
    await expect(
      schema.validate({
        ...validValues,
        attachments: [
          new File(['text'], 'attachment.txt', {
            type: 'text/plain',
          }),
        ],
      })
    ).rejects.toThrow('Attachment must be a JPEG, PNG, or PDF');

    await expect(
      schema.validate({
        ...validValues,
        attachments: [
          new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'attachment.pdf', {
            type: 'application/pdf',
          }),
        ],
      })
    ).rejects.toThrow('Each attachment must be no larger than 5 MB');
  });

  it('counts saved and new files together toward the three-file limit', async () => {
    const saved = {
      name: 'saved.pdf',
      url: 'https://example.com/saved.pdf',
      size: 10,
      type: 'application/pdf',
    };

    const files = ['one.pdf', 'two.pdf', 'three.pdf'].map(
      (name) =>
        new File([new Uint8Array(5 * 1024 * 1024)], name, {
          type: 'application/pdf',
        })
    );

    await expect(
      schema.validate({
        ...validValues,
        attachments: [saved, ...files.slice(0, 2)],
      })
    ).resolves.toBeTruthy();
    await expect(
      schema.validate({ ...validValues, attachments: [saved, ...files] })
    ).rejects.toThrow('Attach up to 3 files');
  });

  it('rejects a future date', async () => {
    await expect(
      schema.validate({ ...validValues, date: '2999-01-01' })
    ).rejects.toThrow('Date cannot be in the future');
  });

  it('rejects a date before the account opening date', async () => {
    await expect(
      schema.validate({ ...validValues, date: '2026-08-07' })
    ).rejects.toThrow('Date cannot be before the account opening date');
  });

  it('accepts the account opening date', async () => {
    await expect(
      schema.validate({ ...validValues, date: '2026-08-08' })
    ).resolves.toBeTruthy();
  });
});

describe('CashTransactionForm', () => {
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

  it('passes unfinished values and the attachment to account creation without validating the form', async () => {
    const user = userEvent.setup();
    const onAddAccount = vi.fn();

    const attachment = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    render(
      <CashTransactionForm
        accounts={accounts}
        categories={categories}
        functionalCurrencyCode="NGN"
        initialValues={{
          ...validValues,
          amount: { ...validValues.amount, amount: Number.NaN },
          attachments: [attachment],
        }}
        onAddAccount={onAddAccount}
        onCurrencyContextChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    await user.clear(screen.getByLabelText('Description'));
    await user.type(
      screen.getByLabelText('Description'),
      'Unfinished transaction'
    );
    await user.click(screen.getByRole('combobox', { name: 'Account' }));
    await user.click(screen.getByRole('option', { name: 'Add a new account' }));
    expect(onAddAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Unfinished transaction',
        attachments: [attachment],
        amount: expect.objectContaining({ amount: Number.NaN }),
      })
    );
  });

  it('passes the unfinished transaction and its attachment to single-category creation', async () => {
    const user = userEvent.setup();
    const onAddCategory = vi.fn();

    const attachment = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    render(
      <CashTransactionForm
        accounts={accounts}
        categories={categories}
        functionalCurrencyCode="NGN"
        initialValues={{
          ...validValues,
          categoryId: '',
          attachments: [attachment],
        }}
        onAddCategory={onAddCategory}
        onCurrencyContextChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    await user.click(screen.getByRole('combobox', { name: 'Category' }));
    await user.click(
      screen.getByRole('option', { name: 'Add a new category' })
    );
    expect(onAddCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        ...validValues,
        categoryId: '',
        attachments: [attachment],
      })
    );
  });

  it.each(['inflow', 'outflow'] as const)(
    'offers %s counterparty creation for an unmatched search with the unfinished transaction',
    async (variant) => {
      const onAddCounterparty = vi.fn();
      const user = userEvent.setup();

      const attachment = new File(['receipt'], 'receipt.pdf', {
        type: 'application/pdf',
      });

      render(
        <CashTransactionForm
          accounts={accounts}
          categories={categories}
          functionalCurrencyCode="NGN"
          variant={variant}
          initialValues={{
            ...validValues,
            amount: { ...validValues.amount, amount: Number.NaN },
            counterparty: { id: '', name: '' },
            attachments: [attachment],
          }}
          counterpartyOptions={[{ id: 'existing', name: 'Existing person' }]}
          onAddCounterparty={onAddCounterparty}
          onCurrencyContextChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      const input = screen.getByRole('combobox', {
        name: variant === 'inflow' ? 'Payer' : 'Recipient',
      });

      await user.type(input, '  New person  ');
      expect(screen.queryByRole('note')).not.toBeInTheDocument();
      await user.click(
        screen.getByRole('option', {
          name: 'Add new counterparty',
        })
      );
      expect(onAddCounterparty).toHaveBeenCalledWith(
        expect.objectContaining({
          counterparty: { id: '', name: '', type: undefined },
          amount: expect.objectContaining({ amount: Number.NaN }),
          attachments: [attachment],
        }),
        'New person'
      );
    }
  );

  it('replaces the search with a created counterparty while preserving the transaction', async () => {
    const user = userEvent.setup();
    const onAddCounterparty = vi.fn();
    const onSubmit = vi.fn();

    const attachment = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    const props = {
      accounts,
      categories,
      functionalCurrencyCode: 'NGN',
      onAddCounterparty,
      onCurrencyContextChange: vi.fn(),
      onSubmit,
    };

    const { rerender } = render(
      <CashTransactionForm
        {...props}
        initialValues={{
          ...validValues,
          attachments: [attachment],
          counterparty: { id: '', name: '' },
        }}
      />
    );

    await user.type(
      screen.getByRole('combobox', { name: 'Person or business' }),
      'Acme'
    );
    await user.click(
      screen.getByRole('option', { name: 'Add new counterparty' })
    );

    const [preservedValues] = onAddCounterparty.mock.calls[0] as [
      ICashTransactionFormValues,
    ];

    const createdCounterparty = {
      id: 'created',
      name: 'Acme Ltd',
      type: 'organization' as const,
    };

    rerender(
      <CashTransactionForm
        {...props}
        initialValues={{
          ...preservedValues,
          counterparty: createdCounterparty,
        }}
      />
    );

    expect(
      screen.getByRole('combobox', { name: 'Person or business' })
    ).toHaveValue('Acme Ltd');
    expect(screen.getByText('receipt.pdf')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
        ...validValues,
        attachments: [attachment],
        counterparty: createdCounterparty,
      })
    );
  });

  it('keeps the add action last for empty, exact, and partial searches', async () => {
    const user = userEvent.setup();
    const onAddCounterparty = vi.fn();
    render(
      <CashTransactionForm
        accounts={accounts}
        categories={categories}
        functionalCurrencyCode="NGN"
        initialValues={{ ...validValues, counterparty: { id: '', name: '' } }}
        counterpartyOptions={[{ id: 'acme', name: 'Acme Consulting' }]}
        onAddCounterparty={onAddCounterparty}
        onCurrencyContextChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    const input = screen.getByRole('combobox', { name: 'Person or business' });
    await user.click(input);
    expect(screen.getAllByRole('option').at(-1)).toHaveTextContent(
      'Add new counterparty'
    );
    await user.type(input, 'Acme Consulting');
    expect(
      screen.getByRole('option', { name: 'Acme Consulting' })
    ).toBeVisible();
    expect(screen.getAllByRole('option').at(-1)).toHaveTextContent(
      'Add new counterparty'
    );
    await user.clear(input);
    await user.type(input, 'Acme');
    expect(
      screen.getByRole('option', { name: 'Acme Consulting' })
    ).toBeVisible();
    expect(screen.getAllByRole('option').at(-1)).toHaveTextContent(
      'Add new counterparty'
    );
    await user.click(
      screen.getByRole('option', { name: 'Add new counterparty' })
    );
    expect(onAddCounterparty).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      'Acme'
    );
  });

  it('shows type icons and relationship badges without changing the selected counterparty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CashTransactionForm
        accounts={accounts}
        categories={categories}
        functionalCurrencyCode="NGN"
        initialValues={{ ...validValues, counterparty: { id: '', name: '' } }}
        counterpartyOptions={[
          {
            id: 'business',
            name: 'Acme Consulting',
            type: 'organization',
            roles: ['vendor', 'contractor', 'employer'],
          },
          {
            id: 'person',
            name: 'Jordan Taylor',
            type: 'individual',
            roles: [],
          },
        ]}
        onAddCounterparty={vi.fn()}
        onCurrencyContextChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );
    const input = screen.getByRole('combobox', { name: 'Person or business' });
    await user.click(input);

    const organization = screen.getByRole('option', {
      name: /Acme Consulting/,
    });

    const individual = screen.getByRole('option', { name: /Jordan Taylor/ });
    expect(
      within(organization).getByRole('img', { name: 'Organization' })
    ).toBeVisible();
    expect(
      within(individual).getByRole('img', { name: 'Individual' })
    ).toBeVisible();
    expect(within(organization).getByText('Vendor')).toBeVisible();
    expect(within(organization).getByText('Contractor')).toBeVisible();
    expect(within(organization).getByText('Employer')).toBeVisible();
    expect(
      within(individual).queryByText(/Vendor|Contractor|Employer/)
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('option').at(-1)).toHaveTextContent(
      'Add new counterparty'
    );
    await user.click(organization);
    expect(input).toHaveValue('Acme Consulting');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
        ...validValues,
        counterparty: {
          id: 'business',
          name: 'Acme Consulting',
          type: 'organization',
        },
      })
    );
  });

  it('selects an existing counterparty and clears its identity when searching for another', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CashTransactionForm
        accounts={accounts}
        categories={categories}
        functionalCurrencyCode="NGN"
        variant="inflow"
        initialValues={{ ...validValues, counterparty: { id: '', name: '' } }}
        counterpartyOptions={[{ id: 'existing', name: 'Existing person' }]}
        onAddCounterparty={vi.fn()}
        onCurrencyContextChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );
    const input = screen.getByRole('combobox', { name: 'Payer' });
    await user.type(input, 'Existing');
    expect(screen.getAllByRole('option').at(-1)).toHaveTextContent(
      'Add new counterparty'
    );
    await user.click(screen.getByRole('option', { name: 'Existing person' }));
    expect(input).toHaveValue('Existing person');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          counterparty: { id: 'existing', name: 'Existing person' },
        })
      )
    );

    onSubmit.mockClear();
    await user.click(input);
    await user.click(
      within(input.parentElement!).getByRole('button', {
        name: 'Clear selection',
      })
    );
    expect(input).toHaveValue('');
    await user.type(input, 'Existing');
    await user.click(screen.getByRole('option', { name: 'Existing person' }));
    await user.type(input, ' changed');
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(await screen.findByText('Payer is required')).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects an unmatched name for both submission and saving a draft without offering creation when unavailable', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onSaveDraft = vi.fn();
    render(
      <CashTransactionForm
        accounts={accounts}
        categories={categories}
        functionalCurrencyCode="NGN"
        variant="inflow"
        initialValues={{ ...validValues, counterparty: { id: '', name: '' } }}
        onCurrencyContextChange={vi.fn()}
        onSubmit={onSubmit}
        onSaveDraft={onSaveDraft}
      />
    );
    await user.type(
      screen.getByRole('combobox', { name: 'Payer' }),
      'Unknown payer'
    );
    expect(screen.getByText('No payers found.')).toBeVisible();
    expect(
      screen.queryByRole('option', { name: 'Add new counterparty' })
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(await screen.findByText('Payer is required')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(onSaveDraft).not.toHaveBeenCalled();
  });

  it('allows creation before the first counterparty exists', async () => {
    const user = userEvent.setup();
    const onAddCounterparty = vi.fn();
    render(
      <CashTransactionForm
        accounts={accounts}
        categories={categories}
        functionalCurrencyCode="NGN"
        variant="inflow"
        onAddCounterparty={onAddCounterparty}
        onCurrencyContextChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    await user.click(screen.getByRole('combobox', { name: 'Payer' }));
    await user.click(
      screen.getByRole('option', { name: 'Add new counterparty' })
    );
    expect(onAddCounterparty).toHaveBeenCalledWith(expect.any(Object), '');
  });

  it('renders the single-entry layout and omits same-currency exchange rate', () => {
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={validValues}
        onCurrencyContextChange={() => undefined}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    expect(screen.getByLabelText('Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Payer')).toBeInTheDocument();
    expect(screen.queryByLabelText('Exchange rate')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toHaveAttribute(
      'placeholder',
      'Select category'
    );
    expect(
      screen.getByRole('button', { name: 'Itemize this transaction' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Attach file')).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,application/pdf'
    );
  });

  it.each<{
    label: string;
    placeholder: string;
    requiredMessage: string;
    variant: UCashTransactionFormVariant | undefined;
  }>([
    {
      label: 'Person or business',
      placeholder: 'Select a person or business',
      requiredMessage: 'Person or business is required',
      variant: undefined,
    },
    {
      label: 'Payer',
      placeholder: 'Select a payer',
      requiredMessage: 'Payer is required',
      variant: 'inflow',
    },
    {
      label: 'Recipient',
      placeholder: 'Select a recipient',
      requiredMessage: 'Recipient is required',
      variant: 'outflow',
    },
  ])(
    'uses $label copy for the counterparty field',
    async ({ label, placeholder, requiredMessage, variant }) => {
      const user = userEvent.setup();

      render(
        <CashTransactionForm
          accounts={accounts}
          categories={categories}
          functionalCurrencyCode="NGN"
          initialValues={{
            ...validValues,
            counterparty: { id: '', name: '' },
          }}
          onCurrencyContextChange={() => undefined}
          onSubmit={() => undefined}
          variant={variant}
        />
      );

      expect(screen.getByRole('combobox', { name: label })).toHaveAttribute(
        'placeholder',
        placeholder
      );

      await user.click(screen.getByRole('button', { name: 'Create' }));

      expect(await screen.findByText(requiredMessage)).toBeInTheDocument();
    }
  );

  it('uses a matching official foreign exchange rate as the default', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const officialRate = {
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1500,
      asOf: '2026-08-10T00:00:00.000Z',
    } as IExchangeRate;

    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={{
          ...validValues,
          accountId: 'usd-bank',
          amount: { ...validValues.amount, currencyCode: 'USD' },
        }}
        officialExchangeRate={officialRate}
        onCurrencyContextChange={() => undefined}
        onSubmit={onSubmit}
        categories={categories}
      />
    );

    expect(screen.getByLabelText('Exchange rate')).toHaveValue('1,500');
    expect(screen.getByText(/Official rate:/)).toHaveTextContent(
      'Official rate: 1500'
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        ...validValues,
        accountId: 'usd-bank',
        amount: { ...validValues.amount, currencyCode: 'USD' },
        exchangeRate: { value: 1500, inverted: false },
      })
    );
  });

  it('preserves an inverted foreign exchange rate through submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={{
          ...validValues,
          accountId: 'usd-bank',
          amount: { ...validValues.amount, currencyCode: 'USD' },
          exchangeRate: { value: 1000, inverted: false },
        }}
        onCurrencyContextChange={() => undefined}
        onSubmit={onSubmit}
        categories={categories}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Invert rates' }));
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          exchangeRate: { value: 0.001, inverted: true },
        })
      )
    );
  });

  it('shows a warning when no official foreign exchange rate is supplied', () => {
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={{
          ...validValues,
          accountId: 'usd-bank',
          amount: { ...validValues.amount, currencyCode: 'USD' },
        }}
        onCurrencyContextChange={() => undefined}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    expect(screen.getByText('No system official rate')).toBeInTheDocument();
  });

  it('reports a foreign account currency with the current date', async () => {
    const user = userEvent.setup();
    const onCurrencyContextChange = vi.fn();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={validValues}
        onCurrencyContextChange={onCurrencyContextChange}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Account' }));
    await user.click(screen.getByRole('option', { name: /^USD bank account/ }));

    expect(onCurrencyContextChange).toHaveBeenLastCalledWith({
      currencyCode: 'USD',
      date: '2026-08-10',
    });
    expect(onCurrencyContextChange).toHaveBeenCalledOnce();
  });

  it('reports a functional-currency account so the parent can clear its query', async () => {
    const user = userEvent.setup();
    const onCurrencyContextChange = vi.fn();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={{ ...validValues, accountId: '' }}
        onCurrencyContextChange={onCurrencyContextChange}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Account' }));
    await user.click(screen.getByRole('option', { name: /^NGN bank account/ }));

    expect(onCurrencyContextChange).toHaveBeenCalledWith({
      currencyCode: 'NGN',
      date: '2026-08-10',
    });
    expect(onCurrencyContextChange).toHaveBeenCalledOnce();
  });

  it('reports the selected date with the current account currency', async () => {
    const user = userEvent.setup();
    const onCurrencyContextChange = vi.fn();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={{
          ...validValues,
          accountId: 'usd-bank',
          amount: { ...validValues.amount, currencyCode: 'USD' },
        }}
        onCurrencyContextChange={onCurrencyContextChange}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    await user.click(screen.getByLabelText('Date'));
    await user.click(screen.getByRole('button', { name: /Sunday, August 9/i }));

    expect(onCurrencyContextChange).toHaveBeenCalledOnce();
    expect(onCurrencyContextChange).toHaveBeenCalledWith({
      currencyCode: 'USD',
      date: '2026-08-09',
    });
  });

  it('disables dates before the selected account opening date', async () => {
    const user = userEvent.setup();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={validValues}
        onCurrencyContextChange={() => undefined}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    await user.click(screen.getByLabelText('Date'));

    expect(
      screen.getByRole('button', { name: /Friday, August 7/i })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /Saturday, August 8/i })
    ).toBeEnabled();
  });

  it('does not show a required error after selecting an account for the first time', async () => {
    const user = userEvent.setup();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={{ ...validValues, accountId: '' }}
        onCurrencyContextChange={() => undefined}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Account' }));
    await user.click(
      await screen.findByRole('option', { name: /^NGN bank account/ })
    );

    await waitFor(() =>
      expect(screen.queryByText('Account is required')).not.toBeInTheDocument()
    );
  });

  it('disables and derives the top amount while itemized', async () => {
    const user = userEvent.setup();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={validValues}
        onCurrencyContextChange={() => undefined}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Itemize this transaction' })
    );

    expect(
      screen.getByRole('button', { name: 'Back to single entry' })
    ).toBeInTheDocument();
    const amountInputs = screen.getAllByLabelText('Amount');
    expect(amountInputs[0]).toBeDisabled();
    expect(amountInputs[0]).toHaveValue('250');

    await user.clear(amountInputs[1]);
    await user.type(amountInputs[1], '100');
    expect(amountInputs[0]).toHaveValue('250');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(amountInputs[0]).toHaveValue('100'));
  });

  it('disables submission only while an itemized row editor is open', async () => {
    const user = userEvent.setup();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={validValues}
        onAddCounterparty={vi.fn()}
        onCurrencyContextChange={() => undefined}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    const createButton = screen.getByRole('button', { name: 'Create' });
    expect(createButton).toBeEnabled();

    await user.click(
      screen.getByRole('button', { name: 'Itemize this transaction' })
    );

    expect(createButton).toBeDisabled();
    await user.click(screen.getByRole('combobox', { name: 'Payer' }));
    expect(
      screen.getByRole('option', { name: 'Add new counterparty' })
    ).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(createButton).toBeEnabled();
    await user.click(screen.getByRole('combobox', { name: 'Payer' }));
    expect(
      screen.getByRole('option', { name: 'Add new counterparty' })
    ).not.toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: 'Edit item 1' }));

    expect(createButton).toBeDisabled();

    await user.click(
      screen.getByRole('button', { name: 'Open item 1 actions' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(createButton).toBeEnabled();
  });

  it('excludes categories already used by another itemized row', async () => {
    const user = userEvent.setup();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={validValues}
        onCurrencyContextChange={() => undefined}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Itemize this transaction' })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Add a new item' }));
    await user.click(screen.getByRole('combobox', { name: 'Category' }));

    expect(
      screen.queryByRole('option', { name: 'Sales revenue' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Professional services' })
    ).toBeInTheDocument();
  });

  it('clears edit mode when a currency change discards a child draft', async () => {
    const user = userEvent.setup();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={validValues}
        onCurrencyContextChange={() => undefined}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Itemize this transaction' })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Edit item 1' }));

    const createButton = screen.getByRole('button', { name: 'Create' });
    expect(createButton).toBeDisabled();

    await user.click(screen.getByRole('combobox', { name: 'Account' }));
    await user.click(screen.getByRole('option', { name: /^USD bank account/ }));

    expect(createButton).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Edit item 1' })
    ).toBeInTheDocument();
  });

  it('keeps edit mode when a currency change recreates the initial draft', async () => {
    const user = userEvent.setup();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={validValues}
        onCurrencyContextChange={() => undefined}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Itemize this transaction' })
    );

    const createButton = screen.getByRole('button', { name: 'Create' });
    expect(createButton).toBeDisabled();

    await user.click(screen.getByRole('combobox', { name: 'Account' }));
    await user.click(screen.getByRole('option', { name: /^USD bank account/ }));

    expect(createButton).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('requires confirmation before discarding additional rows', async () => {
    const user = userEvent.setup();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={validValues}
        onCurrencyContextChange={() => undefined}
        onSubmit={() => undefined}
        categories={categories}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Itemize this transaction' })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Add a new item' }));
    await user.type(screen.getAllByLabelText('Amount')[1], '100');
    await user.click(screen.getByRole('combobox', { name: 'Category' }));
    await user.click(
      screen.getByRole('option', { name: 'Professional services' })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(
      screen.getByRole('button', { name: 'Back to single entry' })
    );

    expect(
      screen.getByRole('alertdialog', { name: 'Return to single entry?' })
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Keep itemized entry' })
    );
    expect(
      screen.getByRole('button', { name: 'Back to single entry' })
    ).toBeInTheDocument();
  });

  it('submits normalized form-owned values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={{ ...validValues, description: ' Transaction ' }}
        onCurrencyContextChange={() => undefined}
        onSubmit={onSubmit}
        categories={categories}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        ...validValues,
        description: 'Transaction',
      })
    );
  });

  it('emits normalized values through the draft action', async () => {
    const user = userEvent.setup();
    const onSaveDraft = vi.fn();
    const onSubmit = vi.fn();
    render(
      <CashTransactionForm
        accounts={accounts}
        variant="inflow"
        functionalCurrencyCode="NGN"
        initialValues={{ ...validValues, description: ' Draft transaction ' }}
        onCurrencyContextChange={() => undefined}
        onSaveDraft={onSaveDraft}
        onSubmit={onSubmit}
        categories={categories}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() =>
      expect(onSaveDraft).toHaveBeenCalledWith({
        ...validValues,
        description: 'Draft transaction',
      })
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
