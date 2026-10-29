import { CashTransferFormSkeleton } from '@/journal-entries/components/cash-transfer-form';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('CashTransferFormSkeleton', () => {
  it('announces the translated loading state', () => {
    render(<CashTransferFormSkeleton />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading transfer form'
    );
  });
});
