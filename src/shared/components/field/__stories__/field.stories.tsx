import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/field';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <FieldGroup className="w-[300px]">
      <Field>
        <FieldLabel>Username</FieldLabel>
        <input className="border rounded px-2 py-1" />
        <FieldDescription>This is your public display name.</FieldDescription>
        <FieldError errors={[{ message: 'Username is taken' }]} />
      </Field>
    </FieldGroup>
  ),
};
