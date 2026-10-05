import { ContractorFormSkeleton } from '@/counterparty/components/contractor-form';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('announces that the contractor form is loading', () => {
  render(<ContractorFormSkeleton />);
  expect(
    screen.getByRole('status', { name: 'Loading contractor form' })
  ).toBeVisible();
});
