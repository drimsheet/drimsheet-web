import {
  LegalEntityList,
  LegalEntityListSkeleton,
} from '@/accounting/pages/legal-entity/parts/entity-list';
import type { IAccountingEntity, TEntityId } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

const entity: IAccountingEntity = {
  id: '00000000-0000-4000-8000-000000000001' as TEntityId,
  createdBy: '00000000-0000-4000-8000-000000000002' as TEntityId,
  ownerId: '00000000-0000-4000-8000-000000000002' as TEntityId,
  name: 'Amara Studio Ltd',
  type: 'private_company',
  status: 'active',
  jurisdictionCode: 'NG',
  functionalCurrencyCode: 'NGN',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const meta = {
  title: 'Accounting/Legal Entity/Entity List',
  component: LegalEntityList,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    currentEntityId: entity.id,
    getEntityHref: (item) => `/legal-entity/${item.id}`,
    entities: [
      entity,
      {
        ...entity,
        id: '00000000-0000-4000-8000-000000000003' as TEntityId,
        name: 'Amara Consulting',
        type: 'sole_trader',
        jurisdictionCode: 'GB',
        functionalCurrencyCode: 'GBP',
      },
      {
        ...entity,
        id: '00000000-0000-4000-8000-000000000004' as TEntityId,
        name: 'Amara Okafor',
        type: 'individual',
      },
    ],
  },
} satisfies Meta<typeof LegalEntityList>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Empty: TStory = { args: { entities: [] } };
export const Archived: TStory = {
  args: { entities: [{ ...entity, status: 'archived' }] },
};
export const LongNames: TStory = {
  args: {
    entities: [
      {
        ...entity,
        name: 'Amara International Architecture and Sustainable Development Consulting Limited',
      },
    ],
  },
};

export const Skeleton: TStory = { render: () => <LegalEntityListSkeleton /> };
