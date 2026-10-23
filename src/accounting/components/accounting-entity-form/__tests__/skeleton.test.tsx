import { AccountingEntityFormSkeleton } from '@/accounting/components/accounting-entity-form';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('provides a screen-reader-only loading announcement without editable fields', () => {
  render(<AccountingEntityFormSkeleton />);

  expect(screen.getByRole('status')).toHaveTextContent(
    'Loading legal entity form'
  );
  expect(screen.getByRole('status')).toHaveClass('sr-only');
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
});
