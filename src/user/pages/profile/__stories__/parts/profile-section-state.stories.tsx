import { ProfileSectionState } from '@/user/pages/profile/parts/profile-section-state';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/Profile/SectionState',
  component: ProfileSectionState,
  tags: ['autodocs'],
  args: { label: 'Preferences', isLoading: true },
} satisfies Meta<typeof ProfileSectionState>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Loading: TStory = {};
export const Failed: TStory = { args: { isLoading: false } };
