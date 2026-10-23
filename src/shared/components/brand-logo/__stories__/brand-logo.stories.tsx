import { BrandLogo } from '@/shared/components/brand-logo';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/BrandLogo',
  component: BrandLogo,
  tags: ['autodocs'],
  args: { alt: 'Drimsheet' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BrandLogo>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const Light: TStory = {
  decorators: [
    (Story) => (
      <div className="light bg-background p-8">
        <Story />
      </div>
    ),
  ],
};

export const Dark: TStory = {
  decorators: [
    (Story) => (
      <div className="dark bg-background p-8">
        <Story />
      </div>
    ),
  ],
};

export const Mark: TStory = { args: { variant: 'mark' } };

export const AuthWordmark: TStory = { args: { className: 'w-48' } };
