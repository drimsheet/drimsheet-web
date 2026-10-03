import type { IAccountingEntity, TEntityId } from '@/shared/lib/api/Api';
import { AccountManagement } from '@/user/components/account-management';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const timestamp = '2026-01-01T00:00:00.000Z';
const activeEntity = {
  id: '00000000-0000-4000-8000-000000000001' as TEntityId,
  name: 'Drimsheet',
  type: 'private_company',
  ownerId: '00000000-0000-4000-8000-000000000100' as TEntityId,
  createdBy: '00000000-0000-4000-8000-000000000100' as TEntityId,
  functionalCurrencyCode: 'NGN',
  jurisdictionCode: 'NG',
  createdAt: timestamp,
  updatedAt: timestamp,
} satisfies IAccountingEntity;
const otherEntity = {
  ...activeEntity,
  id: '00000000-0000-4000-8000-000000000002' as TEntityId,
  name: 'Jane Doe Sole Trader',
  type: 'sole_trader',
} satisfies IAccountingEntity;

describe('AccountManagement', () => {
  it('renders account details and delegates account actions', async () => {
    const user = userEvent.setup();
    const onAddAccount = vi.fn();
    const onSelectEntity = vi.fn();

    render(
      <AccountManagement
        accountingEntities={[activeEntity, otherEntity]}
        activeEntity={activeEntity}
        email="member@example.com"
        onAddAccount={onAddAccount}
        onLogoutClick={() => {}}
        onSelectEntity={onSelectEntity}
        themeAction={<button type="button">Switch theme</button>}
        titleId="account-management-title"
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Account management' })
    ).toBeInTheDocument();
    expect(screen.getByText('Drimsheet')).toBeInTheDocument();
    expect(screen.getByText('member@example.com')).toBeInTheDocument();
    expect(screen.getByText('Private company')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Drop a feedback' })
    ).toBeDisabled();

    await user.click(
      screen.getByRole('button', { name: 'Switch to Jane Doe Sole Trader' })
    );
    expect(onSelectEntity).toHaveBeenCalledWith(otherEntity.id);

    await user.click(screen.getByRole('button', { name: 'Add a new account' }));
    expect(onAddAccount).toHaveBeenCalledOnce();
  });

  it('renders the empty other-accounts state', () => {
    render(
      <AccountManagement
        accountingEntities={[activeEntity]}
        activeEntity={activeEntity}
        onAddAccount={() => {}}
        onLogoutClick={() => {}}
        onSelectEntity={() => {}}
        themeAction={null}
        titleId="account-management-title"
      />
    );

    expect(screen.getByText('No other accounts')).toBeInTheDocument();
  });

  it('emits logout intent without owning the confirmation dialog', async () => {
    const user = userEvent.setup();
    const onLogoutClick = vi.fn();

    render(
      <AccountManagement
        accountingEntities={[activeEntity]}
        activeEntity={activeEntity}
        onAddAccount={() => {}}
        onLogoutClick={onLogoutClick}
        onSelectEntity={() => {}}
        themeAction={null}
        titleId="account-management-title"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(onLogoutClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
