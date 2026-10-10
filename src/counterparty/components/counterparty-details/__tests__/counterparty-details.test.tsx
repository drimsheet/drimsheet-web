import { CounterpartyDetails } from '@/counterparty/components/counterparty-details';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const party: ICounterpartyDto = {
  id: 'one',
  accountingEntityId: 'entity',
  createdBy: '00000000-0000-4000-8000-000000000100',
  name: 'Adenike Supplies Ltd',
  type: 'organization',
  status: 'active',
  roles: ['vendor', 'contractor'],
  meta: {},
  createdAt: '2026-01-12T00:00:00Z',
  updatedAt: '2026-09-18T00:00:00Z',
};

describe('CounterpartyDetails', () => {
  it('shows the localized draft status', () => {
    render(
      <CounterpartyDetails counterparty={{ ...party, status: 'draft' }} />
    );
    expect(screen.getByText('Draft')).toBeVisible();
  });

  it('shows the profile with an edit placeholder and supplied content', () => {
    render(
      <CounterpartyDetails counterparty={party}>
        <p>Transactions supplied by the page</p>
      </CounterpartyDetails>
    );
    expect(
      screen.getByRole('heading', { name: party.name, level: 1 })
    ).toBeVisible();
    expect(screen.getByText('Organization')).toBeVisible();
    expect(screen.getByText('Vendor')).toBeVisible();
    expect(screen.getByText('Contractor')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
    expect(screen.getByText('Transactions supplied by the page')).toBeVisible();
  });
  it('shows missing address and relationship states', () => {
    render(
      <CounterpartyDetails
        counterparty={{ ...party, roles: [], status: 'archived' }}
      />
    );
    expect(screen.getByText('No address provided')).toBeVisible();
    expect(screen.getByText('No relationships')).toBeVisible();
    expect(screen.getByText('Archived')).toBeVisible();
  });
});

it('emits the edit intent without owning the update workflow', async () => {
  const onEdit = vi.fn();
  render(<CounterpartyDetails counterparty={party} onEdit={onEdit} />);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Edit' }));
  expect(onEdit).toHaveBeenCalledOnce();
});

it('shows deletion eligibility progress only inside the actions menu', async () => {
  const onActionsOpenChange = vi.fn();
  render(
    <CounterpartyDetails
      counterparty={party}
      deleteEligibilityChecking
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onActionsOpenChange={onActionsOpenChange}
    />
  );

  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: 'Open counterparty actions' }));
  expect(onActionsOpenChange).toHaveBeenCalledWith(true);

  expect(
    screen.getByRole('status', {
      name: 'Checking whether this counterparty can be deleted',
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

  render(
    <CounterpartyDetails
      counterparty={{ ...party, status: 'archived' }}
      deletable
      onDelete={onDelete}
    />
  );

  const user = userEvent.setup();
  await user.click(
    screen.getByRole('button', { name: 'Open counterparty actions' })
  );
  await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

  expect(onDelete).toHaveBeenCalledOnce();
});

it('does not offer deletion when eligibility is unavailable or false', async () => {
  render(<CounterpartyDetails counterparty={party} onDelete={vi.fn()} />);
  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: 'Open counterparty actions' }));
  expect(screen.getByText('No available actions')).toBeVisible();
  expect(
    screen.queryByRole('menuitem', { name: 'Delete' })
  ).not.toBeInTheDocument();
});
