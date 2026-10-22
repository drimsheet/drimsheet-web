import { AccountingEntityStep } from '@/onboarding/pages/accounting-entity-onboarding/parts/accounting-entity-step';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('replaces the skeleton with the form after options load', () => {
  const props = { currencies: [], jurisdictions: [], onRetry: () => {} };
  const { rerender } = render(<AccountingEntityStep {...props} isLoading />);

  expect(screen.getByRole('status')).toHaveTextContent(
    'Loading legal entity form'
  );
  expect(
    screen.queryByRole('textbox', { name: 'Name' })
  ).not.toBeInTheDocument();

  rerender(<AccountingEntityStep {...props} />);

  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Name' })).toBeEnabled();
});
