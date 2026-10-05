import { EmployerFormSkeleton } from '@/counterparty/components/employer-form';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('announces that the employer form is loading', () => {
  render(<EmployerFormSkeleton />);
  expect(
    screen.getByRole('status', { name: 'Loading employer form' })
  ).toBeVisible();
});
