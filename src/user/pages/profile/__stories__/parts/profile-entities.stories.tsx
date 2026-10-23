import type { IAccountingEntity, TEntityId } from '@/shared/lib/api/Api';
import {
  ProfileEntities,
  ProfileEntitiesSkeleton,
} from '@/user/pages/profile/parts/profile-entities';
import type { Meta, StoryObj } from '@storybook/react-vite';

const entity: IAccountingEntity = {
  id: 'entity-id' as TEntityId,
  name: 'Northstar Studio',
  status: 'active',
  type: 'private_company',
  ownerId: 'user-id' as TEntityId,
  createdBy: 'user-id' as TEntityId,
  jurisdictionCode: 'NG',
  functionalCurrencyCode: 'NGN',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const meta = {
  title: 'User/Profile/LegalEntities',
  component: ProfileEntities,
  tags: ['autodocs'],
  args: {
    userId: 'user-id',
    activeEntityId: entity.id,
    entities: [
      entity,
      {
        ...entity,
        id: 'second-entity' as TEntityId,
        name: 'Amara Okafor',
        type: 'individual',
        jurisdictionCode: 'GB',
        functionalCurrencyCode: 'GBP',
      },
    ],
  },
} satisfies Meta<typeof ProfileEntities>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Empty: TStory = { args: { entities: [] } };
export const LongName: TStory = {
  args: {
    entities: [
      {
        ...entity,
        name: 'Northstar International Accounting and Advisory Services Limited',
      },
    ],
  },
};

export const Skeleton: TStory = { render: () => <ProfileEntitiesSkeleton /> };
