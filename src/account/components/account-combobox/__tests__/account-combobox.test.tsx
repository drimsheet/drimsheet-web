import { AccountCombobox } from '@/account/components/account-combobox';
import {
  ELedgerAccountStatus,
  ELedgerType,
  type ILedgerAccountDto,
  type TEntityId,
  type UAdjunctAccountRule,
  type UContraAccountRule,
  type UNormalBalance,
} from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const mockAccounts: ILedgerAccountDto[] = [
  {
    id: '1' as TEntityId,
    code: '1000',
    name: 'Main Bank Account',
    type: ELedgerType.Asset,
    normalBalance: 'debit' as UNormalBalance,
    subType: 'cash_and_cash_equivalent',
    behavior: 'bank',
    isControlAccount: true,
    status: ELedgerAccountStatus.Active,
    contraAccountRule: 'contra_not_applicable' as UContraAccountRule,
    adjunctAccountRule: 'adjunct_not_applicable' as UAdjunctAccountRule,
    balance: { amount: 1500000, currencyCode: 'NGN', isMinorUnit: false },
    functionalBalance: {
      amount: 1500000,
      currencyCode: 'NGN',
      isMinorUnit: false,
    },
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z',
    createdBy: 'user-1' as TEntityId,
    materializedPath: '',
    accountingEntityId: 'entity-1' as TEntityId,
    openingBalanceDate: null,
  },
  {
    id: '2' as TEntityId,
    code: '2100',
    name: 'Trade Payables',
    type: ELedgerType.Liability,
    normalBalance: 'credit' as UNormalBalance,
    subType: 'payable',
    behavior: 'trade_payable',
    isControlAccount: true,
    status: ELedgerAccountStatus.Active,
    contraAccountRule: 'contra_not_applicable' as UContraAccountRule,
    adjunctAccountRule: 'adjunct_not_applicable' as UAdjunctAccountRule,
    balance: { amount: 4800, currencyCode: 'USD', isMinorUnit: false },
    functionalBalance: {
      amount: 4800,
      currencyCode: 'USD',
      isMinorUnit: false,
    },
    createdAt: '2026-05-10T12:30:00Z',
    updatedAt: '2026-05-10T12:30:00Z',
    createdBy: 'user-1' as TEntityId,
    materializedPath: '',
    accountingEntityId: 'entity-1' as TEntityId,
    openingBalanceDate: null,
  },
  {
    id: '3' as TEntityId,
    code: '4000',
    name: 'Consulting Revenue',
    type: ELedgerType.Revenue,
    normalBalance: 'credit' as UNormalBalance,
    subType: 'services',
    behavior: 'services',
    isControlAccount: false,
    status: ELedgerAccountStatus.Active,
    contraAccountRule: 'contra_not_applicable' as UContraAccountRule,
    adjunctAccountRule: 'adjunct_not_applicable' as UAdjunctAccountRule,
    balance: { amount: 95400, currencyCode: 'USD', isMinorUnit: false },
    functionalBalance: {
      amount: 95400,
      currencyCode: 'USD',
      isMinorUnit: false,
    },
    createdAt: '2026-05-15T09:15:00Z',
    updatedAt: '2026-05-15T09:15:00Z',
    createdBy: 'user-1' as TEntityId,
    materializedPath: '',
    accountingEntityId: 'entity-1' as TEntityId,
    openingBalanceDate: null,
  },
];

describe('AccountCombobox', () => {
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

  it('renders correctly with no initial value', () => {
    const onChange = vi.fn();
    render(
      <AccountCombobox
        label="Account"
        value=""
        onChange={onChange}
        accounts={mockAccounts}
      />
    );

    expect(screen.getByLabelText('Account')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Select an account')
    ).toBeInTheDocument();
  });

  it('renders with an initial value', () => {
    const onChange = vi.fn();
    render(
      <AccountCombobox
        label="Account"
        value="1"
        onChange={onChange}
        accounts={mockAccounts}
      />
    );

    expect(screen.getByRole('combobox', { name: 'Account' })).toHaveValue(
      'Main Bank Account'
    );
  });

  it('opens the combobox and selects an account', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AccountCombobox
        label="Account"
        value=""
        onChange={onChange}
        accounts={mockAccounts}
      />
    );

    const input = screen.getByRole('combobox', { name: 'Account' });
    await user.click(input);

    const option = await screen.findByRole('option', {
      name: /Trade Payables/i,
    });

    expect(option).toBeInTheDocument();

    await user.click(option);

    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('filters accounts when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AccountCombobox
        label="Account"
        value=""
        onChange={onChange}
        accounts={mockAccounts}
      />
    );

    const input = screen.getByRole('combobox', { name: 'Account' });
    await user.type(input, 'consulting');

    expect(
      await screen.findByRole('option', { name: /Consulting Revenue/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: /Main Bank Account/i })
    ).not.toBeInTheDocument();
  });

  it('filters accounts by code', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AccountCombobox
        label="Account"
        value=""
        onChange={onChange}
        accounts={mockAccounts}
      />
    );

    const input = screen.getByRole('combobox', { name: 'Account' });
    await user.type(input, '2100');

    expect(
      await screen.findByRole('option', { name: /Trade Payables/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: /Main Bank Account/i })
    ).not.toBeInTheDocument();
  });

  it('displays an error when error prop is provided', () => {
    const onChange = vi.fn();
    render(
      <AccountCombobox
        label="Account"
        value=""
        onChange={onChange}
        error={[{ message: 'Account is required' }]}
        accounts={mockAccounts}
      />
    );

    expect(screen.getByText('Account is required')).toBeInTheDocument();
  });

  it('shows empty state when no accounts match', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AccountCombobox
        label="Account"
        value=""
        onChange={onChange}
        accounts={mockAccounts}
      />
    );

    const input = screen.getByRole('combobox', { name: 'Account' });
    await user.type(input, 'xyz123');

    expect(await screen.findByText('No accounts found.')).toBeInTheDocument();
  });

  it('handles invalid initial value gracefully', () => {
    const onChange = vi.fn();
    render(
      <AccountCombobox
        label="Account"
        value="invalid"
        onChange={onChange}
        accounts={mockAccounts}
      />
    );

    expect(
      screen.getByRole('combobox', { name: 'Account' })
    ).toBeInTheDocument();
  });
});
