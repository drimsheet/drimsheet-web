import { LegalEntityActions } from '@/accounting/pages/legal-entity/parts/entity-actions';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Legal Entity/Entity Actions',
  component: LegalEntityActions,
  tags: ['autodocs'],
  args: { entityName: 'Amara Studio Ltd', isCurrent: false },
} satisfies Meta<typeof LegalEntityActions>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const CurrentEntity: TStory = { args: { isCurrent: true } };
