import { AccountTypeSelection } from '@/account/components/account-type-selection';
import { ELedgerAccountBehavior } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountTypeSelection',
  component: AccountTypeSelection,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
  args: {
    onSubmit: () => {},
  },
} satisfies Meta<typeof AccountTypeSelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const PreselectedBank: Story = {
  args: {
    defaultValue: ELedgerAccountBehavior.Bank,
  },
};

export const PreselectedPettyCash: Story = {
  args: {
    defaultValue: ELedgerAccountBehavior.PettyCash,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: ELedgerAccountBehavior.Bank,
  },
};

export const Loading: Story = {
  args: { loading: true, defaultValue: ELedgerAccountBehavior.Bank },
};
