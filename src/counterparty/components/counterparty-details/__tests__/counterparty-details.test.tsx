import { CounterpartyDetails } from '@/counterparty/components/counterparty-details';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const party: ICounterpartyDto = {
  id: 'one',
  accountingEntityId: 'entity',
  createdBy: '00000000-0000-4000-8000-000000000100',
  version: 1,
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
