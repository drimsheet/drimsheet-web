import { TransactionsTableSkeleton } from '@/journal-entries/components/transactions-table';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('TransactionsTableSkeleton', () => {
  it('announces that transactions are loading', () => {
    render(<TransactionsTableSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading transactions'
    );
  });
});
