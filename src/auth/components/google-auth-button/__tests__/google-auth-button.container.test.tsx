import { GoogleAuthButtonContainer } from '@/auth/components/google-auth-button';
import { useGoogleOAuth } from '@/auth/hooks/use-google-oauth';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('@/auth/hooks/use-google-oauth', () => ({
  useGoogleOAuth: vi.fn(),
}));

describe('GoogleAuthButtonContainer', () => {
  it('renders GoogleAuthButton and triggers mutate on click', async () => {
    const mockMutate = vi.fn();
    (useGoogleOAuth as Mock).mockReturnValue({ mutate: mockMutate });

    const user = userEvent.setup();
    render(<GoogleAuthButtonContainer />);

    const button = screen.getByRole('button', {
      name: /Continue with Google/i,
    });

    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });
});
