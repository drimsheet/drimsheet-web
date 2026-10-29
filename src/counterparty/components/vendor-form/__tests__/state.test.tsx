import { VendorFormSkeleton } from '@/counterparty/components/vendor-form';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('announces that the vendor form is loading', () => {
  render(<VendorFormSkeleton />);
  expect(
    screen.getByRole('status', { name: 'Loading vendor form' })
  ).toBeVisible();
});
