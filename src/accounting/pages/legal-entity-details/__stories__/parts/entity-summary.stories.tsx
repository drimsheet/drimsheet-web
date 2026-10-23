import fixtures from '@/accounting/pages/legal-entity-details/__stories__/fixtures.json';
import { EntityActions } from '@/accounting/pages/legal-entity-details/parts/entity-actions';
import { EntitySummary } from '@/accounting/pages/legal-entity-details/parts/entity-summary';
import type { IAccountingEntity } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';
const entity = fixtures.entity as IAccountingEntity;

const meta = {
  title: 'Accounting/Legal Entity Details/EntitySummary',
  component: EntitySummary,
  tags: ['autodocs'],
  args: {
    entity,
    actions: (
      <EntityActions
        isCurrent={false}
        archived={false}
        pending={false}
        onEdit={() => {}}
        onSwitch={() => {}}
        onArchive={() => {}}
        onDelete={() => {}}
      />
    ),
  },
} satisfies Meta<typeof EntitySummary>;

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
      name: 'Amara International Architecture and Sustainable Development Limited',
    },
  },
};
