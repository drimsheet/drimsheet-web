import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

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
    name: 'Global Tech Corp',
    status: ECounterpartyStatus.Active,
    type: ECounterpartyType.Organization,
    roles: [ECounterpartyRole.Employer, ECounterpartyRole.Vendor],
    meta: {},
    createdAt: '2026-05-15T09:15:00Z',
    updatedAt: '2026-05-15T09:15:00Z',
  },
  {
    id: '4' as TEntityId,
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

const meta = {
  title: 'Counterparty/CounterpartiesTable',
  component: CounterpartiesTable,
  tags: ['autodocs'],
  args: {
    onSortChange: (key, direction) =>
      console.log('Sort changed:', key, direction),
    onFilterChange: (filters) => console.log('Filter changed:', filters),
    onAddCounterparty: () => console.log('Add counterparty clicked'),
    onSearchChange: (value) => console.log('Search changed:', value),
    filters: {},
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-full max-w-5xl p-6 bg-background rounded-2xl border border-border/80 shadow-xs">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof CounterpartiesTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: mockCounterparties,
    selectable: true,
    stickyHeader: true,
    searchValue: '',
  },
};

export const LoadingState: Story = {
  args: {
    data: [],
    loading: true,
  },
};

export const EmptyState: Story = {
  args: {
    data: [],
    loading: false,
  },
};
