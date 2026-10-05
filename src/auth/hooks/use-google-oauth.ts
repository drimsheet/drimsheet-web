import { useMutation } from '@tanstack/react-query';

export function useGoogleOAuth() {
  return useMutation({
    mutationFn: () => {
      window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google`;

      return Promise.resolve();
    },
  });
}
