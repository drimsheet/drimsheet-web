import { Money, MoneyJurisdictionProvider } from '@/shared/components/money';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Money', () => {
  it('hides zero minor units by default', () => {
    render(
      <Money
        localCode="US"
        value={{ amount: 123400, currencyCode: 'USD', isMinorUnit: true }}
      />
    );

    expect(screen.getByText('$1,234')).toBeInTheDocument();
  });

  it('shows zero minor units when explicitly requested', () => {
    render(
      <Money
        localCode="US"
        hideZeroMinorUnit={false}
        value={{ amount: 123400, currencyCode: 'USD', isMinorUnit: true }}
      />
    );

    expect(screen.getByText('$1,234.00')).toBeInTheDocument();
  });

  it('keeps non-zero minor units with the default formatting', () => {
    render(
      <Money
        localCode="US"
        value={{ amount: 123450, currencyCode: 'USD', isMinorUnit: true }}
      />
    );

    expect(screen.getByText('$1,234.50')).toBeInTheDocument();
  });

  it('defaults to US formatting regardless of the currency', () => {
    render(
      <Money
        value={{ amount: 123456, currencyCode: 'EUR', isMinorUnit: true }}
      />
    );

    expect(screen.getByText('€1,234.56')).toBeInTheDocument();
  });

  it('formats different currencies using the active jurisdiction', () => {
    render(
      <MoneyJurisdictionProvider value="DE">
        <Money
          value={{ amount: 123456, currencyCode: 'USD', isMinorUnit: true }}
        />
        <Money
          value={{ amount: 123456, currencyCode: 'EUR', isMinorUnit: true }}
        />
      </MoneyJurisdictionProvider>
    );

    expect(screen.getByText('1.234,56 $')).toBeInTheDocument();
    expect(screen.getByText('1.234,56 €')).toBeInTheDocument();
  });

  it('updates formatting when the active jurisdiction changes', () => {
    const value = { amount: 123456, currencyCode: 'EUR', isMinorUnit: true };

    const { rerender } = render(
      <MoneyJurisdictionProvider value="DE">
        <Money value={value} />
      </MoneyJurisdictionProvider>
    );

    expect(screen.getByText('1.234,56 €')).toBeInTheDocument();

    rerender(
      <MoneyJurisdictionProvider value="US">
        <Money value={value} />
      </MoneyJurisdictionProvider>
    );

    expect(screen.getByText('€1,234.56')).toBeInTheDocument();
  });

  it('allows an explicit jurisdiction to override the active jurisdiction', () => {
    render(
      <MoneyJurisdictionProvider value="DE">
        <Money
          localCode="US"
          value={{ amount: 123456, currencyCode: 'EUR', isMinorUnit: true }}
        />
      </MoneyJurisdictionProvider>
    );

    expect(screen.getByText('€1,234.56')).toBeInTheDocument();
  });

  it('falls back to US formatting for an unknown jurisdiction', () => {
    render(
      <MoneyJurisdictionProvider value="ZZ">
        <Money
          value={{ amount: 123456, currencyCode: 'EUR', isMinorUnit: true }}
        />
      </MoneyJurisdictionProvider>
    );

    expect(screen.getByText('€1,234.56')).toBeInTheDocument();
  });
});

it('shows the approximation symbol only when converted', () => {
  const value = { amount: 1234, currencyCode: 'USD', isMinorUnit: false };
  const { rerender } = render(<Money value={value} />);
  expect(screen.queryByText('≈')).not.toBeInTheDocument();
  expect(screen.queryByText('approximately')).not.toBeInTheDocument();
  rerender(<Money value={value} isConverted />);
  expect(screen.getByText('≈')).toBeVisible();
  expect(screen.getByText('≈')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByText('approximately')).toHaveClass('sr-only');
  expect(screen.getByText('approximately')).not.toHaveAttribute('aria-hidden');
  rerender(<Money value={value} isConverted={false} />);
  expect(screen.queryByText('≈')).not.toBeInTheDocument();
  expect(screen.queryByText('approximately')).not.toBeInTheDocument();
});

it.each([
  [6660000, '+₦66.6K'],
  [-6670000, '-₦66.7K'],
])(
  'renders compact signed naira amounts with the symbol (%s)',
  (amount, expected) => {
    render(
      <Money
        value={{ amount, currencyCode: 'NGN', isMinorUnit: true }}
        notation="compact"
        signDisplay="exceptZero"
        currencyDisplay="narrowSymbol"
        maximumFractionDigits={1}
      />
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
  }
);
