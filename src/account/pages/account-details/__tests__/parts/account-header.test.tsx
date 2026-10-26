import { AccountHeader } from '@/account/pages/account-details/parts/account-header';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('AccountHeader', () => {
  it.each(['active', 'archived', 'draft'] as const)(
    'shows the name and %s status',
    (status) => {
      render(
        <AccountHeader account={{ name: 'Main business account', status }} />
      );

      expect(
        screen.getByRole('heading', { level: 1, name: 'Main business account' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(new RegExp(`^${status}$`, 'i'))
      ).toBeInTheDocument();
    }
  );
});
