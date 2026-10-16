import { ProfileForm } from '@/user/components/profile-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/ProfileForm',
  component: ProfileForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    initialValues: { firstName: 'Amara', lastName: 'Okafor' },
    onSubmit: async () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof ProfileForm>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Saving: TStory = { args: { isSaving: true } };
export const SaveFailed: TStory = { args: { hasError: true } };
export const EmptyNames: TStory = {
  args: { initialValues: { firstName: '', lastName: '' } },
};
