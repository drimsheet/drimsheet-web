import { TransactionActivityChart } from '@/journal-entries/pages/transactions/parts/transaction-activity-chart';
import { MoneyJurisdictionProvider } from '@/shared/components/money';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => vi.restoreAllMocks());

it('formats axis and tooltip amounts using the active money jurisdiction', async () => {
  const user = userEvent.setup();
  const getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      if (this.classList.contains('recharts-responsive-container')) {
        return new DOMRect(0, 0, 640, 320);
      }

      return getBoundingClientRect.call(this);
    }
  );

  render(
    <MoneyJurisdictionProvider value="DE">
      <TransactionActivityChart
        currencyCode="EUR"
        days={[
          {
            date: '2026-10-01',
            in: { amount: 100050, currencyCode: 'EUR', isMinorUnit: true },
            out: { amount: 0, currencyCode: 'EUR', isMinorUnit: false },
            revenue: 1000.5,
            expense: 0,
          },
        ]}
      />
    </MoneyJurisdictionProvider>
  );

  expect(await screen.findByText('0 €')).toBeInTheDocument();

  await user.tab();
  await user.keyboard('{ArrowRight}');

  expect(await screen.findByText('1.000,50 €')).toBeInTheDocument();
});
