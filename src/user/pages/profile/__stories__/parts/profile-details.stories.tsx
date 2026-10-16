import { Button } from '@/shared/components/button';
import type { TEntityId } from '@/shared/lib/api/Api';
import { ProfileDetails } from '@/user/pages/profile/parts/profile-details';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pencil } from 'lucide-react';

const meta = {
  title: 'User/Profile/Details',
  component: ProfileDetails,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
  args: {
    editAction: (
      <Button variant="outline" size="sm">
        <Pencil className="size-3.5" data-icon="inline-start" aria-hidden />
        Edit
      </Button>
    ),
    profile: {
      id: 'profile-id' as TEntityId,
      firstName: 'Amara',
      lastName: 'Okafor',
      email: 'amara@northstar.studio',
      emailVerified: true,
      createdAt: '2025-06-12T09:00:00Z',
      updatedAt: '2026-10-01T09:00:00Z',
    },
  },
} satisfies Meta<typeof ProfileDetails>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Unverified: TStory = {
  args: { profile: { ...meta.args.profile, emailVerified: false } },
};
export const LongDetails: TStory = {
  args: {
    profile: {
      ...meta.args.profile,
      firstName: 'Alexandria-Catherine',
      lastName: 'Montgomery-Wellington',
      email: 'alexandria.catherine.montgomery@northstar-accounting.example.com',
    },
  },
};
