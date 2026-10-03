import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    version: 1,
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
    version: 1,
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
    version: 1,
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
  onSearchChange: vi.fn(),
  onAddCounterparty: vi.fn(),
  filters: {},
  searchValue: '',
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

  it('triggers onSearchChange when search value is entered', async () => {
    const onSearchChange = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CounterpartiesTable
          {...defaultProps}
          onSearchChange={onSearchChange}
        />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(
      /search counterparties.../i
    );
    await user.type(searchInput, 'Alice');

    expect(onSearchChange).toHaveBeenCalled();
  });

  it('triggers onAddCounterparty when add button is clicked', async () => {
    const onAddCounterparty = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CounterpartiesTable
          {...defaultProps}
          onAddCounterparty={onAddCounterparty}
        />
      </MemoryRouter>
    );

    const addButton = screen.getByRole('button', { name: /add counterparty/i });
    await user.click(addButton);

    expect(onAddCounterparty).toHaveBeenCalledTimes(1);
  });
});
