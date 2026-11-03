import { CounterpartyDetails } from '@/counterparty/components/counterparty-details';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const party: ICounterpartyDto = {
  id: 'one',
  accountingEntityId: 'entity',
  createdBy: '00000000-0000-4000-8000-000000000100',
  name: 'Adenike Supplies Ltd',
  type: 'organization',
  status: 'active',
  roles: ['vendor', 'contractor'],
  roleDetails: {},
  createdAt: '2026-01-12T00:00:00Z',
  updatedAt: '2026-09-18T00:00:00Z',
};

describe('CounterpartyDetails', () => {
  it('shows relationships and missing address', () => {
    render(<CounterpartyDetails counterparty={party} />);
    expect(screen.getByText('Vendor')).toBeVisible();
    expect(screen.getByText('Contractor')).toBeVisible();
    expect(screen.getByText('No address provided')).toBeVisible();
  });
  it('shows the missing relationships state', () => {
    render(<CounterpartyDetails counterparty={{ ...party, roles: [] }} />);
    expect(screen.getByText('No relationships')).toBeVisible();
  });
});
