import { Button } from '@/shared/components/button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemSkeleton,
  DropdownMenuTrigger,
} from '..';

const meta = {
  title: 'Shared UI/DropdownMenu/Skeleton',
  component: DropdownMenuItemSkeleton,
  args: { 'aria-label': 'Checking deletion eligibility' },
  decorators: [
    (Story) => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <Story />
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  ],
} satisfies Meta<typeof DropdownMenuItemSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
