import type { ReactNode } from 'react';

export type UTransitionState = 'loading' | 'error' | 'success';

export type WithTransitionStateProps<TData> = {
  loading: ReactNode;
  error: ReactNode;
  /** Invoked only for success, with the supplied data. Do not call hooks here. */
  children: (data: NonNullable<TData>) => ReactNode;
} & (
  | {
      /** Omitting state renders success. */
      state?: 'success';
      data: NonNullable<TData>;
    }
  | {
      state: 'loading';
      data?: TData | null;
    }
  | {
      state: 'error';
      data?: TData | null;
    }
);
