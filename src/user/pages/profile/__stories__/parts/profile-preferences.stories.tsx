import { ProfilePreferences } from '@/user/pages/profile/parts/profile-preferences';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/Profile/Preferences',
  component: ProfilePreferences,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
  args: {
    preferences: { theme: 'light', appUsageMode: 'non_power_user' },
    onChange: () => {},
  },
} satisfies Meta<typeof ProfilePreferences>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Saving: TStory = { args: { isSaving: true } };
export const Saved: TStory = { args: { isSaved: true } };
export const Failed: TStory = { args: { hasError: true } };
export const ManualAndSystem: TStory = {
  args: { preferences: { theme: 'system', appUsageMode: 'power_user' } },
};
