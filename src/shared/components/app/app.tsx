import type { PropsWithChildren } from 'react';

export function AppBody({ children }: Readonly<PropsWithChildren>) {
  return <div className="flex w-full flex-col pt-0 max-w-full">{children}</div>;
}
