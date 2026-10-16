import { EntityDetails } from '@/accounting/pages/legal-entity/parts/entity-details';
import type { IAccountingEntity, TEntityId } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const entity: IAccountingEntity = {
  id: 'entity-1' as TEntityId,
  createdBy: 'user-1' as TEntityId,
  ownerId: 'user-1' as TEntityId,
  name: 'Northstar Studio',
  status: 'active',
  type: 'private_company',
  functionalCurrencyCode: 'NGN',
  jurisdictionCode: 'NG',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const meta = {
  title: 'Accounting/Legal Entity/EntityDetails',
  component: EntityDetails,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: { entity: entity },
} satisfies Meta<typeof EntityDetails>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Archived: TStory = {
  args: { entity: { ...entity, status: 'archived' } },
};
export const LongName: TStory = {
  args: {
    entity: {
      ...entity,
      name: 'Northstar International Accounting and Advisory Services Limited',
    },
  },
};
