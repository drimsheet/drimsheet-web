import { useLaunchDarklyContextSynchronization } from '@/_app/containers/launchdarkly/launchdarkly-context-synchronization';
import { LaunchDarklyContextSynchronizerContainer } from '@/_app/containers/launchdarkly/launchdarkly-context-synchronizer.container';
import { authService } from '@/auth/lib/services/auth.service';
import { useProfile } from '@/user/hooks/use-profile';
import { useLDClient } from '@launchdarkly/react-sdk';
import { render, screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/_app/containers/launchdarkly/launchdarkly', () => ({
  anonymousLaunchDarklyContext: {
    kind: 'user',
    anonymous: true,
  },
}));

vi.mock('@/auth/lib/services/auth.service', () => ({
  authService: {
    isLoggedIn: vi.fn(),
  },
}));

vi.mock('@/user/hooks/use-profile', () => ({
  useProfile: vi.fn(),
}));

vi.mock('@/shared/lib/services/observability.service', () => ({
  observabilityService: {
    report: vi.fn(),
  },
}));

vi.mock('@launchdarkly/react-sdk', () => ({
  useLDClient: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
}));

describe('LaunchDarklyContextSynchronizerContainer', () => {
  const identify = vi.fn().mockResolvedValue({ status: 'completed' });
  const getContext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLocation).mockReturnValue({ key: 'route-key' } as never);
    vi.mocked(useLDClient).mockReturnValue({ identify, getContext } as never);
  });

  function SynchronizationStatus() {
    const synchronizationState = useLaunchDarklyContextSynchronization();

    return <p>{synchronizationState.status}</p>;
  }

  it('identifies the authenticated profile', async () => {
    vi.mocked(authService.isLoggedIn).mockReturnValue(true);
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'profile-id', email: 'profile@example.com' },
    } as never);
    getContext.mockReturnValue({ kind: 'user', anonymous: true });

    render(<LaunchDarklyContextSynchronizerContainer />);

    expect(useProfile).toHaveBeenCalledWith({ enabled: true });
    await waitFor(() => {
      expect(identify).toHaveBeenCalledWith({
        kind: 'user',
        key: 'profile@example.com',
        email: 'profile@example.com',
        _meta: {
          privateAttributes: ['email'],
        },
      });
    });
  });

  it('restores an anonymous context after logout', async () => {
    vi.mocked(authService.isLoggedIn).mockReturnValue(false);
    vi.mocked(useProfile).mockReturnValue({ data: undefined } as never);
    getContext.mockReturnValue({
      kind: 'user',
      key: 'profile@example.com',
    });

    render(<LaunchDarklyContextSynchronizerContainer />);

    expect(useProfile).toHaveBeenCalledWith({ enabled: false });
    await waitFor(() => {
      expect(identify).toHaveBeenCalledWith({
        kind: 'user',
        anonymous: true,
      });
    });
  });

  it('does not identify again when the current context already matches', () => {
    vi.mocked(authService.isLoggedIn).mockReturnValue(true);
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'profile-id', email: 'profile@example.com' },
    } as never);
    getContext.mockReturnValue({
      kind: 'user',
      key: 'profile@example.com',
      email: 'profile@example.com',
    });

    render(<LaunchDarklyContextSynchronizerContainer />);

    expect(identify).not.toHaveBeenCalled();
  });

  it('identifies again when the current context does not include the email', async () => {
    vi.mocked(authService.isLoggedIn).mockReturnValue(true);
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'profile-id', email: 'profile@example.com' },
    } as never);
    getContext.mockReturnValue({
      kind: 'user',
      key: 'profile@example.com',
    });

    render(<LaunchDarklyContextSynchronizerContainer />);

    await waitFor(() => {
      expect(identify).toHaveBeenCalledWith({
        kind: 'user',
        key: 'profile@example.com',
        email: 'profile@example.com',
        _meta: {
          privateAttributes: ['email'],
        },
      });
    });
  });

  it('remains synchronizing until identify completes', async () => {
    let completeIdentify:
      | ((value: { status: 'completed' }) => void)
      | undefined;

    identify.mockReturnValueOnce(
      new Promise((resolve) => {
        completeIdentify = resolve;
      })
    );
    vi.mocked(authService.isLoggedIn).mockReturnValue(true);
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'profile-id', email: 'profile@example.com' },
      error: null,
    } as never);
    getContext.mockReturnValue({ kind: 'user', anonymous: true });

    render(
      <LaunchDarklyContextSynchronizerContainer>
        <SynchronizationStatus />
      </LaunchDarklyContextSynchronizerContainer>
    );

    expect(screen.getByText('synchronizing')).toBeInTheDocument();

    completeIdentify?.({ status: 'completed' });

    await waitFor(() => {
      expect(screen.getByText('ready')).toBeInTheDocument();
    });
  });

  it('becomes ready immediately when the signed-in context already matches', async () => {
    vi.mocked(authService.isLoggedIn).mockReturnValue(true);
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'profile-id', email: 'profile@example.com' },
      error: null,
    } as never);
    getContext.mockReturnValue({
      kind: 'user',
      key: 'profile@example.com',
      email: 'profile@example.com',
    });

    render(
      <LaunchDarklyContextSynchronizerContainer>
        <SynchronizationStatus />
      </LaunchDarklyContextSynchronizerContainer>
    );

    await waitFor(() => {
      expect(screen.getByText('ready')).toBeInTheDocument();
    });
    expect(identify).not.toHaveBeenCalled();
  });

  it('exposes an identify failure', async () => {
    const error = new Error('identify failed');
    identify.mockResolvedValueOnce({ status: 'error', error });
    vi.mocked(authService.isLoggedIn).mockReturnValue(true);
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'profile-id', email: 'profile@example.com' },
      error: null,
    } as never);
    getContext.mockReturnValue({ kind: 'user', anonymous: true });

    render(
      <LaunchDarklyContextSynchronizerContainer>
        <SynchronizationStatus />
      </LaunchDarklyContextSynchronizerContainer>
    );

    await waitFor(() => {
      expect(screen.getByText('failed')).toBeInTheDocument();
    });
  });

  it('exposes a profile bootstrap failure without identifying', () => {
    vi.mocked(authService.isLoggedIn).mockReturnValue(true);
    vi.mocked(useProfile).mockReturnValue({
      data: undefined,
      error: new Error('profile failed'),
    } as never);
    getContext.mockReturnValue({ kind: 'user', anonymous: true });

    render(
      <LaunchDarklyContextSynchronizerContainer>
        <SynchronizationStatus />
      </LaunchDarklyContextSynchronizerContainer>
    );

    expect(screen.getByText('failed')).toBeInTheDocument();
    expect(identify).not.toHaveBeenCalled();
  });
});
