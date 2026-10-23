import { LegalEntityListSkeleton } from '@/accounting/pages/legal-entity/parts/skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Legal Entity/Skeleton',
  component: LegalEntityListSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof LegalEntityListSkeleton>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
