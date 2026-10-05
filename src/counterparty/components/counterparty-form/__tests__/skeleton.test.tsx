import { CounterpartyFormSkeleton } from '@/counterparty/components/counterparty-form';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('announces that the counterparty form is loading', () => {
  render(<CounterpartyFormSkeleton />);
  expect(
    screen.getByRole('status', { name: 'Loading counterparty for editing' })
  ).toBeVisible();
});
