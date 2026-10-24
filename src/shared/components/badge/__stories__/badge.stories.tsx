import { Badge } from '@/shared/components/badge';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
};

export const Primary: Story = {
  args: { children: 'Primary', variant: 'primary' },
};

export const Neutral: Story = {
  args: { children: 'Neutral', variant: 'neutral' },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const BothThemes: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {['light', 'dark'].map((theme) => (
        <div key={theme} className={theme}>
          <div className="flex flex-wrap items-center gap-3 rounded-md bg-background p-6 text-foreground">
            <Badge>Current</Badge>
            <Badge variant="neutral">Vendor</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="outline">Owner</Badge>
            <Badge variant="ghost">Archived</Badge>
            <Badge variant="link" asChild>
              <a href="#details">Details</a>
            </Badge>
          </div>
        </div>
      ))}
    </div>
  ),
};
