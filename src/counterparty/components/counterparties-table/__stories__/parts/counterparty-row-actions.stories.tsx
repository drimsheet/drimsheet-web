import { CounterpartyRowActions } from '@/counterparty/components/counterparties-table/parts/counterparty-row-actions';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const counterparty: ICounterpartyDto = {
  id: '00000000-0000-4000-8000-000000000010',
  accountingEntityId: '00000000-0000-4000-8000-000000000002',
  createdBy: '00000000-0000-4000-8000-000000000001',
  name: 'Adenike Supplies',
  status: 'active',
  type: 'organization',
  roles: ['vendor'],
  meta: {},
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const meta = {
  title: 'Counterparty/CounterpartiesTable/Parts/CounterpartyRowActions',
  component: CounterpartyRowActions,
  tags: ['autodocs'],
  args: {
    counterparty,
    onArchive: async () => undefined,
    onEdit: () => undefined,
  },
} satisfies Meta<typeof CounterpartyRowActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Archived: Story = {
  args: { counterparty: { ...counterparty, status: 'archived' } },
};
