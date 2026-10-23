import { AuthConsent } from '@/auth/components/auth-consent';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

describe('AuthConsent', () => {
  it('renders correctly with default action text', () => {
    render(
      <MemoryRouter>
        <AuthConsent />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/By creating an account, you agree to our/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Terms of Service/i })
    ).toHaveAttribute('href', '/terms-of-service');
    expect(
      screen.getByRole('link', { name: /Privacy Policy/i })
    ).toHaveAttribute('href', '/privacy-policy');
  });

  it('renders correctly with custom action text', () => {
    render(
      <MemoryRouter>
        <AuthConsent actionText="signing up" />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/By signing up, you agree to our/i)
    ).toBeInTheDocument();
  });
});
