import { RequestPasswordResetForm } from '@/auth/components/request-password-reset-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

describe('RequestPasswordResetForm', () => {
  it('exposes autocomplete="email" on the email input', () => {
    render(
      <MemoryRouter>
        <RequestPasswordResetForm onSubmit={vi.fn()} loading={false} />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('associates aria-invalid and aria-describedby when submitted empty', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RequestPasswordResetForm onSubmit={vi.fn()} loading={false} />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', {
      name: /Get password reset link/i,
    });

    await user.click(submitButton);

    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    const errorId = emailInput.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();

    const errorMessage = screen.getByText(/Email is required/i);
    expect(errorMessage).toHaveAttribute('id', errorId!);
  });

  it('associates format validation error for invalid email and removes error on fix', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RequestPasswordResetForm onSubmit={vi.fn()} loading={false} />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'invalid-email');
    await user.tab();

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    const errorMessage = screen.getByText(/Enter a valid email/i);
    expect(errorMessage).toBeInTheDocument();

    await user.clear(emailInput);
    await user.type(emailInput, 'valid@example.com');
    await user.tab();

    expect(emailInput).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByText(/Enter a valid email/i)).not.toBeInTheDocument();
  });

  it('calls onSubmit with entered email when form is valid', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <MemoryRouter>
        <RequestPasswordResetForm onSubmit={handleSubmit} loading={false} />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'user@example.com');

    const submitButton = screen.getByRole('button', {
      name: /Get password reset link/i,
    });

    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({ email: 'user@example.com' });
  });

  it('disables controls, sets aria-busy, and prevents submission when loading', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <MemoryRouter>
        <RequestPasswordResetForm onSubmit={handleSubmit} loading={true} />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toBeDisabled();

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();

    const form = emailInput.closest('form');
    expect(form).toHaveAttribute('aria-busy', 'true');

    await user.type(emailInput, 'user@example.com{enter}');
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
