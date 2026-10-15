import { CounterpartyShare } from '@/account/pages/category-details/parts/counterparty-share';
import type { IAccountCounterpartyParticipationDto } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

const counterparties: IAccountCounterpartyParticipationDto[] = [
  'Google',
  'Microsoft',
  'Notion',
].map((name, index) => ({
  counterparty: {
    id: name,
    name,
    accountingEntityId: 'entity',
    createdBy: 'user',
    status: 'active',
    type: 'organization',
    roles: ['vendor'],
    meta: {},
    createdAt: '2026-10-01',
    updatedAt: '2026-10-01',
  },
  isSelf: false,
  participation: {
    totalShare: [45, 25, 15][index],
    functionalAmount: {
      amount: [1080000, 600000, 360000][index],
      currencyCode: 'NGN',
      isMinorUnit: false,
    },
    amount: {
      amount: [1080000, 600000, 360000][index],
      currencyCode: 'NGN',
      isMinorUnit: false,
    },
  },
}));

const meta = {
  title: 'Account/Category details/Counterparty share',
  component: CounterpartyShare,
  tags: ['autodocs'],
  args: {
    counterparties,
    selectedId: null,
    onSelect: fn(),
    loading: false,
    error: false,
    onPageChange: fn(),
    onRetry: fn(),
    pagination: { page: 1, limit: 5, total: 8, totalPages: 2 },
  },
} satisfies Meta<typeof CounterpartyShare>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Selected: TStory = { args: { selectedId: 'Google' } };
export const Loading: TStory = { args: { loading: true } };
export const Error: TStory = { args: { error: true } };
export const Empty: TStory = {
  args: { counterparties: [], pagination: undefined },
};
export const SignedAndUnavailable: TStory = {
  args: {
    pagination: undefined,
    counterparties: [
      {
        ...counterparties[0],
        participation: {
          ...counterparties[0].participation,
          totalShare: 125.25,
        },
      },
      {
        ...counterparties[1],
        counterparty: null,
        isSelf: true,
        participation: {
          ...counterparties[1].participation,
          totalShare: -25.25,
          functionalAmount: {
            amount: -606000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
        },
      },
      {
        ...counterparties[2],
        counterparty: null,
        participation: { ...counterparties[2].participation, totalShare: null },
      },
    ],
  },
};
