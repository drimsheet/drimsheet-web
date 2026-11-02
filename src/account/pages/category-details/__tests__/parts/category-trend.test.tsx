import {
  CategoryTrend,
  CategoryTrendWithState,
} from '@/account/pages/category-details/parts/category-trend';
import { MoneyJurisdictionProvider } from '@/shared/components/money';
import { render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => vi.restoreAllMocks());

it('formats Y-axis amounts in major units using the active money jurisdiction', async () => {
  const getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      if (this.classList.contains('recharts-responsive-container')) {
        return new DOMRect(0, 0, 640, 224);
      }

      return getBoundingClientRect.call(this);
    }
  );

  const chart = (
    <CategoryTrend
      months={[{ month: '2026-06', amount: 1000 }]}
      currencyCode="EUR"
      type="expense"
    />
  );

  const { rerender } = render(
    <MoneyJurisdictionProvider value="US">{chart}</MoneyJurisdictionProvider>
  );

  expect(await screen.findByText('€1K')).toBeInTheDocument();

  rerender(
    <MoneyJurisdictionProvider value="DE">{chart}</MoneyJurisdictionProvider>
  );

  expect(await screen.findByText('1000 €')).toBeInTheDocument();
});

it('does not mistake loading or failure for an empty activity report', () => {
  const content = (
    <CategoryTrend months={[]} currencyCode="NGN" type="expense" />
  );

  const { rerender } = render(
    <CategoryTrendWithState loading error>
      {content}
    </CategoryTrendWithState>
  );

  expect(
    screen.getByRole('status', { name: 'Loading transactions chart' })
  ).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(
    screen.queryByText('No expenses or income in this period.')
  ).not.toBeInTheDocument();

  rerender(
    <CategoryTrendWithState loading={false} error>
      {content}
    </CategoryTrendWithState>
  );
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Category details unavailable'
  );
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(
    screen.queryByText('No expenses or income in this period.')
  ).not.toBeInTheDocument();

  rerender(
    <CategoryTrendWithState loading={false}>{content}</CategoryTrendWithState>
  );
  expect(
    screen.getByText('No expenses or income in this period.')
  ).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
