import { SignupForm } from '@/auth/components/signup-form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('SignupForm', () => {
  it('renders correctly', () => {
    render(<SignupForm onSubmit={vi.fn()} loading={false} />);

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Create account/i })
    ).toBeInTheDocument();
  });

  it('exposes credential autocomplete attributes on the form and inputs', () => {
    render(<SignupForm onSubmit={vi.fn()} loading={false} />);

    const emailInput = screen.getByLabelText(/Email/i);
    const form = emailInput.closest('form');

    expect(form).toHaveAttribute('autocomplete', 'on');
    expect(emailInput).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByLabelText(/^Password$/i)).toHaveAttribute(
      'autocomplete',
      'new-password'
    );
  });

  it('shows required validation errors on submit empty', async () => {
    const user = userEvent.setup();
    render(<SignupForm onSubmit={vi.fn()} loading={false} />);

    await user.click(screen.getByRole('button', { name: /Create account/i }));

    const fields = [
      {
        input: screen.getByLabelText(/First Name/i),
        error: await screen.findByText(/First Name is required/i),
      },
      {
        input: screen.getByLabelText(/Last Name/i),
        error: screen.getByText(/Last Name is required/i),
      },
      {
        input: screen.getByLabelText(/Email/i),
        error: screen.getByText(/Email is required/i),
      },
      {
        input: screen.getByLabelText(/^Password$/i),
        error: screen.getByText(/Password is required/i),
      },
    ];

    for (const { input, error } of fields) {
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', error.id);
      expect(error.id).not.toBe('');
    }
  });

  it('removes a corrected field error without affecting other errors', async () => {
    const user = userEvent.setup();
    render(<SignupForm onSubmit={vi.fn()} loading={false} />);

    await user.click(screen.getByRole('button', { name: /Create account/i }));
    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);

    expect(await screen.findByText(/First Name is required/i)).toBeVisible();
    await user.type(firstNameInput, 'Jane');

    await waitFor(() => {
      expect(firstNameInput).not.toHaveAttribute('aria-invalid');
      expect(firstNameInput).not.toHaveAttribute('aria-describedby');
      expect(
        screen.queryByText(/First Name is required/i)
      ).not.toBeInTheDocument();
    });
    expect(lastNameInput).toHaveAttribute('aria-invalid', 'true');
    expect(lastNameInput).toHaveAttribute('aria-describedby', 'lastName-error');
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<SignupForm onSubmit={vi.fn()} loading={false} />);

    await user.type(screen.getByLabelText(/Email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    expect(await screen.findByText(/Enter a valid email/i)).toBeInTheDocument();
  });

  describe('Password Validation', () => {
    it('requires at least 8 characters', async () => {
      const user = userEvent.setup();
      render(<SignupForm onSubmit={vi.fn()} loading={false} />);

      await user.type(screen.getByLabelText(/^Password$/i), 'Short1!');
      await user.click(screen.getByRole('button', { name: /Create account/i }));

      expect(
        await screen.findByText(/Password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });

    it('requires at least one number', async () => {
      const user = userEvent.setup();
      render(<SignupForm onSubmit={vi.fn()} loading={false} />);

      await user.type(screen.getByLabelText(/^Password$/i), 'NoNumbers!');
      await user.click(screen.getByRole('button', { name: /Create account/i }));

      expect(
        await screen.findByText(/Password must contain at least one number/i)
      ).toBeInTheDocument();
    });

    it('requires at least one special character', async () => {
      const user = userEvent.setup();
      render(<SignupForm onSubmit={vi.fn()} loading={false} />);

      await user.type(screen.getByLabelText(/^Password$/i), 'NoSpecialChar1');
      await user.click(screen.getByRole('button', { name: /Create account/i }));

      expect(
        await screen.findByText(
          /Password must contain at least one special character/i
        )
      ).toBeInTheDocument();
    });

    it('accepts valid passwords', async () => {
      const user = userEvent.setup();
      render(<SignupForm onSubmit={vi.fn()} loading={false} />);

      await user.type(screen.getByLabelText(/First Name/i), 'John');
      await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await user.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
      await user.type(screen.getByLabelText(/^Password$/i), 'Valid1Password!');

      await user.click(screen.getByRole('button', { name: /Create account/i }));

      await waitFor(() => {
        expect(screen.queryByText(/Password must/i)).not.toBeInTheDocument();
      });
    });
  });

  it('calls onSubmit with valid form values', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<SignupForm onSubmit={handleSubmit} loading={false} />);

    await user.type(screen.getByLabelText(/First Name/i), 'Jane');
    await user.type(screen.getByLabelText(/Last Name/i), 'Smith');
    await user.type(screen.getByLabelText(/Email/i), 'jane.smith@example.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'Secure123!');

    await user.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith(
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          password: 'Secure123!',
        },
        expect.anything()
      );
    });
  });

  it('passes loading state to button', () => {
    render(<SignupForm onSubmit={vi.fn()} loading={true} />);

    const submitButton = screen.getByRole('button', {
      name: /Create account/i,
    });

    expect(submitButton).toBeDisabled();
  });

  it('forwards custom className and container props', () => {
    render(
      <SignupForm
        onSubmit={vi.fn()}
        loading={false}
        className="custom-signup-form"
        data-testid="signup-form-container"
      />
    );

    const container = screen.getByTestId('signup-form-container');
    expect(container).toHaveClass('custom-signup-form');
  });
});
