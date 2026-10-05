import '@/_app/i18n/config';
import { ResetPasswordForm } from '@/auth/components/reset-password-form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

describe('ResetPasswordForm', () => {
  it('renders password fields with autocomplete attributes', () => {
    render(
      <MemoryRouter>
        <ResetPasswordForm onSubmit={vi.fn()} loading={false} />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/New Password/i);
    expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');

    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    expect(confirmPasswordInput).toHaveAttribute(
      'autocomplete',
      'new-password'
    );
  });

  it('shows required validation errors and sets aria-invalid and aria-describedby when submitting empty', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResetPasswordForm onSubmit={vi.fn()} loading={false} />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

    const submitButton = screen.getByRole('button', {
      name: /Reset password/i,
    });

    await user.click(submitButton);

    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error');

    expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'true');
    expect(confirmPasswordInput).toHaveAttribute(
      'aria-describedby',
      'confirmPassword-error'
    );
  });

  it('validates password min length, number, and special character rules', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResetPasswordForm onSubmit={vi.fn()} loading={false} />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/New Password/i);

    const submitButton = screen.getByRole('button', {
      name: /Reset password/i,
    });

    // Too short
    await user.type(passwordInput, 'Short1!');
    await user.click(submitButton);
    expect(
      await screen.findByText(/Password must be at least 8 characters/i)
    ).toBeInTheDocument();

    // Missing number
    await user.clear(passwordInput);
    await user.type(passwordInput, 'NoNumberSpecial!');
    await user.click(submitButton);
    expect(
      await screen.findByText(/Password must contain at least one number/i)
    ).toBeInTheDocument();

    // Missing special char
    await user.clear(passwordInput);
    await user.type(passwordInput, 'NoSpecial123');
    await user.click(submitButton);
    expect(
      await screen.findByText(
        /Password must contain at least one special character/i
      )
    ).toBeInTheDocument();
  });

  it('validates that password and confirmPassword must match', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResetPasswordForm onSubmit={vi.fn()} loading={false} />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

    const submitButton = screen.getByRole('button', {
      name: /Reset password/i,
    });

    await user.type(passwordInput, 'StrongPassword1!');
    await user.type(confirmPasswordInput, 'DifferentPassword2@');
    await user.click(submitButton);

    expect(
      await screen.findByText(/Passwords must match/i)
    ).toBeInTheDocument();
  });

  it('calls onSubmit with form values when valid', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <MemoryRouter>
        <ResetPasswordForm onSubmit={handleSubmit} loading={false} />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

    const submitButton = screen.getByRole('button', {
      name: /Reset password/i,
    });

    await user.type(passwordInput, 'ValidPassword123!');
    await user.type(confirmPasswordInput, 'ValidPassword123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Passwords must match/i)
      ).not.toBeInTheDocument();
    });

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit.mock.calls[0][0]).toEqual({
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
    });
  });

  it('disables inputs and button and sets aria-busy when loading is true', () => {
    render(
      <MemoryRouter>
        <ResetPasswordForm onSubmit={vi.fn()} loading={true} />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

    const submitButton = screen.getByRole('button', {
      name: /Reset password/i,
    });

    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    const formElement = passwordInput.closest('form');
    expect(formElement).toHaveAttribute('aria-busy', 'true');
  });
});
