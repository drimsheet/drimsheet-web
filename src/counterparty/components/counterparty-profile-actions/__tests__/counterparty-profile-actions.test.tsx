import { CounterpartyProfileActions } from '@/counterparty/components/counterparty-profile-actions';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
it('emits the edit intent without owning the update workflow', async () => {
  const onEdit = vi.fn();
  render(<CounterpartyProfileActions onEdit={onEdit} />);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Edit' }));
  expect(onEdit).toHaveBeenCalledOnce();
});

it('shows deletion eligibility progress only inside the actions menu', async () => {
  const onActionsOpenChange = vi.fn();
  render(
    <CounterpartyProfileActions
      deleteEligibilityChecking
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onActionsOpenChange={onActionsOpenChange}
    />
  );

  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  await userEvent
    .setup()
    .click(
      screen.getByRole('button', { name: 'Open person or business actions' })
    );
  expect(onActionsOpenChange).toHaveBeenCalledWith(true);

  expect(
    screen.getByRole('status', {
      name: 'Checking whether this person or business can be deleted',
    })
  ).toBeVisible();
  expect(
    screen.queryByRole('menuitem', { name: 'Delete' })
  ).not.toBeInTheDocument();
  await userEvent.setup().keyboard('{Escape}');
  expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled();
});

it('emits delete intent when the API marks the counterparty as deletable', async () => {
  const onDelete = vi.fn();

  render(<CounterpartyProfileActions deletable onDelete={onDelete} />);

  const user = userEvent.setup();
  await user.click(
    screen.getByRole('button', { name: 'Open person or business actions' })
  );
  await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

  expect(onDelete).toHaveBeenCalledOnce();
});

it('does not offer deletion when eligibility is unavailable or false', async () => {
  render(<CounterpartyProfileActions onDelete={vi.fn()} />);
  await userEvent
    .setup()
    .click(
      screen.getByRole('button', { name: 'Open person or business actions' })
    );
  expect(screen.getByText('No available actions')).toBeVisible();
  expect(
    screen.queryByRole('menuitem', { name: 'Delete' })
  ).not.toBeInTheDocument();
});
