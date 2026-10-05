import { Button } from '@/shared/components/button';
import type { IAccountingEntity, TEntityId } from '@/shared/lib/api/Api';
import { AccountManagement } from '@/user/components/account-management';
import type { Meta, StoryObj } from '@storybook/react-vite';

const timestamp = '2026-01-01T00:00:00.000Z';
const ownerId = '00000000-0000-4000-8000-000000000100' as TEntityId;

const activeEntity = {
  id: '00000000-0000-4000-8000-000000000001' as TEntityId,
  name: 'Drimsheet',
  type: 'private_company',
  ownerId,
  createdBy: ownerId,
  functionalCurrencyCode: 'NGN',
  jurisdictionCode: 'NG',
  createdAt: timestamp,
  updatedAt: timestamp,
} satisfies IAccountingEntity;

const otherEntity = {
  ...activeEntity,
  id: '00000000-0000-4000-8000-000000000002' as TEntityId,
  name: 'Jane Doe Sole Trader',
  type: 'sole_trader',
} satisfies IAccountingEntity;

const meta = {
  title: 'User/AccountManagement',
  component: AccountManagement,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80 rounded-xl bg-popover text-popover-foreground ring-1 ring-foreground/10">
        <Story />
      </div>
    ),
  ],
  args: {
    accountingEntities: [activeEntity, otherEntity],
    activeEntity,
    email: 'member@example.com',
    onAddAccount: () => {},
    onLogoutClick: () => {},
    onSelectEntity: () => {},
    themeAction: (
      <Button
        variant="ghost"
        className="w-full justify-start rounded-none px-5"
      >
        Switch theme
      </Button>
    ),
    titleId: 'account-management-title',
  },
} satisfies Meta<typeof AccountManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleAccount: Story = {
  args: { accountingEntities: [activeEntity] },
};
