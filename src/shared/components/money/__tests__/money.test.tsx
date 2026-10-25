import { Money } from '@/shared/components/money';
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

    expect(screen.getByText('US$1,234')).toBeInTheDocument();
  });

  it('shows zero minor units when explicitly requested', () => {
    render(
      <Money
        localCode="US"
        hideZeroMinorUnit={false}
        value={{ amount: 123400, currencyCode: 'USD', isMinorUnit: true }}
      />
    );

    expect(screen.getByText('US$1,234.00')).toBeInTheDocument();
  });

  it('keeps non-zero minor units with the default formatting', () => {
    render(
      <Money
        localCode="US"
        value={{ amount: 123450, currencyCode: 'USD', isMinorUnit: true }}
      />
    );

    expect(screen.getByText('US$1,234.50')).toBeInTheDocument();
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
