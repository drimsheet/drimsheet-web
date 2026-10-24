import { StatusBadge } from '@/shared/components/status-badge';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'success',
        'info',
        'warning',
        'error',
        'neutral',
        'primary',
        'secondary',
      ],
    },
    showDot: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    label: 'Success',
    variant: 'success',
  },
};

export const Info: Story = {
  args: {
    label: 'Info',
    variant: 'info',
  },
};

export const Warning: Story = {
  args: {
    label: 'Warning',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    label: 'Error',
    variant: 'error',
  },
};

export const Neutral: Story = {
  args: {
    label: 'Neutral',
    variant: 'neutral',
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: { label: 'Secondary', variant: 'secondary' },
};

export const WithoutDot: Story = {
  args: {
    label: 'No Dot Badge',
    variant: 'primary',
    showDot: false,
  },
};

export const WithDot: Story = {
  args: { label: 'Active', variant: 'success', showDot: true },
};

export const BothThemes: Story = {
  args: { label: 'Active' },
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {['light', 'dark'].map((theme) => (
        <div key={theme} className={theme}>
          <div className="flex flex-wrap items-center gap-3 rounded-md bg-background p-6 text-foreground">
            <StatusBadge variant="success" label="Active" />
            <StatusBadge variant="neutral" label="Draft" />
            <StatusBadge variant="neutral" label="Archived" />
            <StatusBadge variant="info" label="Info" />
            <StatusBadge variant="warning" label="Warning" />
            <StatusBadge variant="error" label="Error" />
            <StatusBadge variant="primary" label="Primary" />
            <StatusBadge variant="secondary" label="Secondary" />
          </div>
        </div>
      ))}
    </div>
  ),
};
