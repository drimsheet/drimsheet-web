import { CounterpartyRoleSelect } from '@/counterparty/components/counterparty-role-select';
import { ECounterpartyRole } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('CounterpartyRoleSelect', () => {
  it('renders title and all four role options as enabled radio controls', () => {
    render(<CounterpartyRoleSelect onSubmit={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: /select a role/i })
    ).toBeInTheDocument();

    const defaultRadio = screen.getByRole('radio', { name: /default/i });
    const employerRadio = screen.getByRole('radio', { name: /employer/i });
    const contractorRadio = screen.getByRole('radio', { name: /contractor/i });
    const vendorRadio = screen.getByRole('radio', { name: /vendor/i });

    expect(defaultRadio).toBeEnabled();
    expect(employerRadio).toBeEnabled();
    expect(contractorRadio).toBeEnabled();
    expect(vendorRadio).toBeEnabled();
  });

  it('selects default option on click and enables continue button to submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<CounterpartyRoleSelect onSubmit={onSubmit} />);

    const defaultRadio = screen.getByRole('radio', { name: /default/i });
    expect(defaultRadio).toHaveAttribute('aria-checked', 'false');

    await user.click(defaultRadio);

    expect(defaultRadio).toHaveAttribute('aria-checked', 'true');

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeEnabled();

    await user.click(continueBtn);
    expect(onSubmit).toHaveBeenCalledWith('default');
  });

  it('selects contractor option on click and submits', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<CounterpartyRoleSelect onSubmit={onSubmit} />);

    const contractorRadio = screen.getByRole('radio', { name: /contractor/i });

    await user.click(contractorRadio);

    expect(contractorRadio).toHaveAttribute('aria-checked', 'true');

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    await user.click(continueBtn);

    expect(onSubmit).toHaveBeenCalledWith(ECounterpartyRole.Contractor);
  });

  it('triggers onSubmit when Continue button is clicked with a selection', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CounterpartyRoleSelect
        defaultValue={ECounterpartyRole.Employer}
        onSubmit={onSubmit}
      />
    );

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeEnabled();

    await user.click(continueBtn);

    expect(onSubmit).toHaveBeenCalledWith(ECounterpartyRole.Employer);
  });

  it('disables Continue button when no value is selected', () => {
    render(<CounterpartyRoleSelect onSubmit={vi.fn()} />);

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it('navigates to option using keyboard Space key and submits', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CounterpartyRoleSelect
        defaultValue={ECounterpartyRole.Employer}
        onSubmit={onSubmit}
      />
    );

    const vendorRadio = screen.getByRole('radio', { name: /vendor/i });
    vendorRadio.focus();

    await user.keyboard(' ');

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    await user.click(continueBtn);

    expect(onSubmit).toHaveBeenCalledWith(ECounterpartyRole.Vendor);
  });

  it('respects disabled prop', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CounterpartyRoleSelect
        disabled
        defaultValue={ECounterpartyRole.Vendor}
        onSubmit={onSubmit}
      />
    );

    const vendorRadio = screen.getByRole('radio', { name: /vendor/i });
    await user.click(vendorRadio);

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });
});
