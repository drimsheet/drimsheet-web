import { RouteLink } from '@/shared/components/route-link';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

const meta = {
  title: 'Shared UI/Route Link',
  component: RouteLink,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: { to: '/legal-entity', children: 'Legal entities' },
  argTypes: {
    color: {
      control: 'select',
      options: ['default', 'foreground', 'muted', 'inherit'],
    },
    underline: { control: 'select', options: ['always', 'hover', 'none'] },
  },
} satisfies Meta<typeof RouteLink>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};
export const AlwaysUnderlined: TStory = { args: { underline: 'always' } };
export const NoUnderline: TStory = { args: { underline: 'none' } };
export const Foreground: TStory = { args: { color: 'foreground' } };
export const Muted: TStory = { args: { color: 'muted' } };
export const Inherited: TStory = { args: { color: 'inherit' } };
