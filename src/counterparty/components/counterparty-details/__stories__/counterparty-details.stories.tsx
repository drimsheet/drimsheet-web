import { CounterpartyDetails } from '@/counterparty/components/counterparty-details';
import type { Meta, StoryObj } from '@storybook/react-vite';

const address = {
  line1: '14 Adeola Odeku Street',
  city: 'Victoria Island',
  region: 'Lagos',
  countryCode: 'NG',
};

const meta = {
  title: 'Counterparty/CounterpartyDetails',
  component: CounterpartyDetails,
  tags: ['autodocs'],
  args: {
    deletable: true,
    onDelete: () => {},
    onEdit: () => {},
    counterparty: {
      id: 'counterparty-1',
      accountingEntityId: 'entity-1',
      createdBy: '00000000-0000-4000-8000-000000000100',
      name: 'Adenike Supplies Ltd',
      type: 'organization',
      status: 'active',
      roles: ['vendor', 'contractor'],
      meta: { vendor: { address }, contractor: { address } },
      createdAt: '2026-01-12T00:00:00Z',
      updatedAt: '2026-09-18T00:00:00Z',
    },
  },
} satisfies Meta<typeof CounterpartyDetails>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const CheckingDeletionEligibility: Story = {
  args: { deleteEligibilityChecking: true },
};
export const WithoutAddress: Story = {
  args: {
    counterparty: {
      ...meta.args.counterparty,
      meta: {},
      roles: [],
      type: 'individual',
    },
  },
};
export const DistinctAddresses: Story = {
  args: {
    counterparty: {
      ...meta.args.counterparty,
      meta: {
        vendor: { address },
        contractor: { address: { ...address, line1: '24 Marina Road' } },
      },
    },
  },
};
export const Archived: Story = {
  args: {
    editDisabled: true,
    counterparty: { ...meta.args.counterparty, status: 'archived' },
  },
};
export const LongName: Story = {
  args: {
    counterparty: {
      ...meta.args.counterparty,
      name: 'Adenike Supplies and International Logistics Services Limited',
    },
  },
};
