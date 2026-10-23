import { RequestPasswordResetSuccess } from '@/auth/components/reset-password-request-success';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

describe('RequestPasswordResetSuccess', () => {
  it('offers sign-in navigation without a resend control', () => {
    render(
      <MemoryRouter>
        <RequestPasswordResetSuccess />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('link', { name: 'Back to sign in' })
    ).toHaveAttribute('href', '/auth/signin');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('uses the supplied sign-in destination', () => {
    render(
      <MemoryRouter>
        <RequestPasswordResetSuccess signInHref="/custom-signin" />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('link', { name: 'Back to sign in' })
    ).toHaveAttribute('href', '/custom-signin');
  });
});
