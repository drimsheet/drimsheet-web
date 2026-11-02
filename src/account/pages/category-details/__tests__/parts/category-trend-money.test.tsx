import { CategoryTrend } from '@/account/pages/category-details/parts/category-trend';
import { MoneyJurisdictionProvider } from '@/shared/components/money';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => vi.restoreAllMocks());

it('formats tooltip amounts using the active money jurisdiction', async () => {
  const user = userEvent.setup();
  const getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      if (this.classList.contains('recharts-responsive-container')) {
        return new DOMRect(0, 0, 640, 224);
      }

      return getBoundingClientRect.call(this);
    }
  );

  render(
    <MoneyJurisdictionProvider value="DE">
      <CategoryTrend
        months={[{ month: '2026-06', amount: 1000 }]}
        currencyCode="EUR"
        type="expense"
      />
    </MoneyJurisdictionProvider>
  );

  await user.tab();
  await user.keyboard('{ArrowRight}');

  expect(await screen.findByText('1.000 €')).toBeInTheDocument();
});
