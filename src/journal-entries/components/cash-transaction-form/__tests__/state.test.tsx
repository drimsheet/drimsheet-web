import { CashTransactionFormSkeleton } from '@/journal-entries/components/cash-transaction-form';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('CashTransactionFormSkeleton', () => {
  it('announces the translated loading state', () => {
    render(<CashTransactionFormSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading transaction form'
    );
  });
});
