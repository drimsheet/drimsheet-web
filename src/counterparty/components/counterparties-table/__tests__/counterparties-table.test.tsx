import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { CounterpartiesTable } from '@/counterparty/components/counterparties-table';
import {
  ECounterpartyRole,
  ECounterpartyStatus,
  ECounterpartyType,
  type ICounterpartyDto,
  type TEntityId,
} from '@/shared/lib/api/Api';

const mockCounterparties: ICounterpartyDto[] = [
  {
    id: '1' as TEntityId,
    accountingEntityId: 'entity-1' as TEntityId,
    createdBy: '00000000-0000-4000-8000-000000000100',
    name: 'Alice Smith',
    status: ECounterpartyStatus.Active,
    type: ECounterpartyType.Individual,
    roles: [ECounterpartyRole.Contractor],
    meta: {},
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z',
  },
  {
    id: '2' as TEntityId,
    accountingEntityId: 'entity-1' as TEntityId,
    createdBy: '00000000-0000-4000-8000-000000000100',
    name: 'Acme Supplies Ltd',
    status: ECounterpartyStatus.Active,
    type: ECounterpartyType.Organization,
    roles: [ECounterpartyRole.Vendor],
    meta: {},
    createdAt: '2026-05-10T12:30:00Z',
    updatedAt: '2026-05-10T12:30:00Z',
  },
  {
    id: '3' as TEntityId,
    accountingEntityId: 'entity-1' as TEntityId,
    createdBy: '00000000-0000-4000-8000-000000000100',
    name: 'Bob Johnson',
    status: ECounterpartyStatus.Archived,
    type: ECounterpartyType.Individual,
    roles: [],
    meta: {},
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-05-20T10:00:00Z',
  },
];

const defaultProps = {
  data: mockCounterparties,
  loading: false,
  selectable: true,
  onSortChange: vi.fn(),
  onFilterChange: vi.fn(),
  filters: {},
};

describe('CounterpartiesTable', () => {
  it('renders table headers correctly', () => {
    render(
      <MemoryRouter>
        <CounterpartiesTable {...defaultProps} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('columnheader', { name: /name/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /status/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /type/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /roles/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /created on/i })
    ).toBeInTheDocument();
  });

  it('renders counterparty rows with correct details, badges and fallback representation', () => {
    render(
      <MemoryRouter>
        <CounterpartiesTable {...defaultProps} />
      </MemoryRouter>
    );

    // Names
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Acme Supplies Ltd')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

    // Badges/statuses
    expect(screen.getAllByText('Active')).toHaveLength(2);
    expect(screen.getByText('Archived')).toBeInTheDocument();

    // Types
    expect(screen.getAllByText('Individual')).toHaveLength(2);
    expect(screen.getByText('Organization')).toBeInTheDocument();

    // Roles
    expect(screen.getByText('Contractor')).toBeInTheDocument();
    expect(screen.getByText('Vendor')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument(); // fallback for Bob Johnson who has no roles
  });
});
