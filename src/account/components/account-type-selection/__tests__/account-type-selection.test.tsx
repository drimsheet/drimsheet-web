import { AccountTypeSelection } from '@/account/components/account-type-selection';
import { ELedgerAccountBehavior } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('AccountTypeSelection', () => {
  it('renders title and all four account type options as enabled radio controls', () => {
    render(<AccountTypeSelection onSubmit={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: /select account type/i })
    ).toBeInTheDocument();

    const bankRadio = screen.getByRole('radio', { name: /bank account/i });
    const pettyCashRadio = screen.getByRole('radio', { name: /petty cash/i });

    const virtualAccountRadio = screen.getByRole('radio', {
      name: /virtual account/i,
    });

    const creditCardRadio = screen.getByRole('radio', { name: /credit card/i });

    expect(bankRadio).toBeEnabled();
    expect(pettyCashRadio).toBeEnabled();
    expect(virtualAccountRadio).toBeEnabled();
    expect(creditCardRadio).toBeEnabled();

    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });

  it('selects option on click and enables continue button to submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<AccountTypeSelection onSubmit={onSubmit} />);

    const bankRadio = screen.getByRole('radio', { name: /bank account/i });
    expect(bankRadio).toHaveAttribute('aria-checked', 'false');

    await user.click(bankRadio);

    expect(bankRadio).toHaveAttribute('aria-checked', 'true');

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeEnabled();

    await user.click(continueBtn);
    expect(onSubmit).toHaveBeenCalledWith(ELedgerAccountBehavior.Bank);
  });

  it('selects virtual account option on click and submits', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<AccountTypeSelection onSubmit={onSubmit} />);

    const virtualAccountRadio = screen.getByRole('radio', {
      name: /virtual account/i,
    });

    await user.click(virtualAccountRadio);

    expect(virtualAccountRadio).toHaveAttribute('aria-checked', 'true');

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    await user.click(continueBtn);

    expect(onSubmit).toHaveBeenCalledWith(ELedgerAccountBehavior.DefaultCash);
  });

  it('triggers onSubmit when Continue button is clicked with a selection', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AccountTypeSelection
        defaultValue={ELedgerAccountBehavior.PettyCash}
        onSubmit={onSubmit}
      />
    );

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeEnabled();

    await user.click(continueBtn);

    expect(onSubmit).toHaveBeenCalledWith(ELedgerAccountBehavior.PettyCash);
  });

  it('disables Continue button when no value is selected', () => {
    render(<AccountTypeSelection onSubmit={vi.fn()} />);

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it('navigates to option using keyboard Space key and submits', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AccountTypeSelection
        defaultValue={ELedgerAccountBehavior.Bank}
        onSubmit={onSubmit}
      />
    );

    const pettyCashRadio = screen.getByRole('radio', { name: /petty cash/i });
    pettyCashRadio.focus();

    await user.keyboard(' ');

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    await user.click(continueBtn);

    expect(onSubmit).toHaveBeenCalledWith(ELedgerAccountBehavior.PettyCash);
  });

  it('respects disabled prop', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AccountTypeSelection
        disabled
        defaultValue={ELedgerAccountBehavior.Bank}
        onSubmit={onSubmit}
      />
    );

    const bankRadio = screen.getByRole('radio', { name: /bank account/i });
    await user.click(bankRadio);

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });
});
