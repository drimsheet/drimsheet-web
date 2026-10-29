import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageBreadcrumbsSkeleton } from '..';

const meta = {
  title: 'Shared/Page-Breadcrumbs/Skeleton',
  component: PageBreadcrumbsSkeleton,
  args: {},
  tags: ['autodocs'],
} satisfies Meta<typeof PageBreadcrumbsSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
