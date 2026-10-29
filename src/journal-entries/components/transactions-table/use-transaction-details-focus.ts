import { useCallback, useRef } from 'react';

export function useTransactionDetailsFocus() {
  const trigger = useRef<HTMLButtonElement | null>(null);

  const rememberTrigger = useCallback((element: HTMLButtonElement) => {
    trigger.current = element;
  }, []);

  const restoreFocus = useCallback((event: Event) => {
    if (trigger.current?.isConnected) {
      event.preventDefault();
      trigger.current.focus();
    }
  }, []);

  return { rememberTrigger, restoreFocus };
}
