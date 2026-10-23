import type { ReactElement, ReactNode } from 'react';

export interface IErrorBoundaryFallbackData {
  readonly error: unknown;
  readonly componentStack: string;
  readonly eventId: string;
}

export type TErrorBoundaryFallback =
  | ReactElement
  | ((errorData: IErrorBoundaryFallbackData) => ReactElement);

export interface DefaultErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: TErrorBoundaryFallback;
}

export interface DefaultErrorFallbackProps {
  readonly error: unknown;
}
