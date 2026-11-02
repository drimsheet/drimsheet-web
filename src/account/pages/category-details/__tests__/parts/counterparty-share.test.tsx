import { CounterpartyShare } from '@/account/pages/category-details/parts/counterparty-share';
import type { CounterpartyShareProps } from '@/account/pages/category-details/types';
import type { IAccountBalanceContributionsByCounterpartyDto } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

const row: IAccountBalanceContributionsByCounterpartyDto = {
  counterparty: null,
  isSelf: true,
  participation: {
    totalShare: 33.33,
    functionalAmount: { amount: 1000, currencyCode: 'NGN', isMinorUnit: false },
    amount: { amount: 1, currencyCode: 'USD', isMinorUnit: false },
  },
};

it('draws proportional bars only for available shares within zero to one hundred percent', () => {
  const props: CounterpartyShareProps = {
    type: 'revenue',
    counterparties: [row],
    loading: false,
    error: false,
    selectedId: null,
    onSelect: () => {},
    onPageChange: () => {},
  };

  const { rerender } = render(<CounterpartyShare {...props} />);

  expect(
    screen
      .getByRole('button', { name: /Self/ })
      .querySelector('[aria-hidden="true"]')
  ).toBeInTheDocument();

  for (const share of [125.25, -25.25, null]) {
    rerender(
      <CounterpartyShare
        {...props}
        counterparties={[
          {
            ...row,
            participation: { ...row.participation, totalShare: share },
          },
        ]}
      />
    );

    expect(
      screen
        .getByRole('button', { name: /Self/ })
        .querySelector('[aria-hidden="true"]')
    ).toBeNull();
  }

  expect(
    screen.getByLabelText('Share unavailable at zero balance')
  ).toHaveTextContent('—');
});
