import { EntityTypeCards } from '@/accounting/components/accounting-entity-form/parts/entity-type-cards';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';

const meta = {
  title: 'Accounting/Accounting Entity Form/Entity Type Cards',
  component: EntityTypeCards,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-[620px] p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    id: 'entity-type',
    value: '',
    errors: [],
    onChange: () => {},
    onBlur: () => {},
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();

    return (
      <EntityTypeCards {...args} onChange={(value) => updateArgs({ value })} />
    );
  },
} satisfies Meta<typeof EntityTypeCards>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Selected: TStory = { args: { value: 'individual' } };
export const Disabled: TStory = {
  args: { disabled: true, value: 'sole_trader' },
};
export const Invalid: TStory = {
  args: { errors: [{ message: 'Select who these records are for.' }] },
};
