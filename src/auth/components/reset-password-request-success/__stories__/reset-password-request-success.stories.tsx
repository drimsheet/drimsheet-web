import { RequestPasswordResetSuccess } from '@/auth/components/reset-password-request-success';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

const meta = {
  title: 'Auth/RequestPasswordResetSuccess',
  component: RequestPasswordResetSuccess,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="p-4 max-w-sm mx-auto">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RequestPasswordResetSuccess>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
