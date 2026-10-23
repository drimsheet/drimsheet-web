import { cn } from '@/shared/lib/utils/cn';
import type { KeyboardEvent } from 'react';
import type { TabsProps } from './types';
import { useTabsIndicator } from './use-tabs-indicator';

export function Tabs({
  items,
  value,
  onValueChange,
  ariaLabel,
}: Readonly<TabsProps>) {
  const { tabListRef, indicatorStyle } = useTabsIndicator({ items, value });

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const enabledItems = items.filter((item) => !item.disabled);

    const selectedIndex = enabledItems.findIndex(
      (item) => item.value === value
    );

    let nextIndex: number;

    if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = enabledItems.length - 1;
    } else {
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      nextIndex =
        (selectedIndex + direction + enabledItems.length) % enabledItems.length;
    }

    const nextItem = enabledItems[nextIndex];

    if (nextItem) {
      onValueChange(nextItem.value);
    }
  };

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label={ariaLabel}
      className="relative isolate inline-flex rounded-md bg-muted p-1"
    >
      {indicatorStyle && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 rounded-sm bg-primary shadow-xs transition-[transform,width,height] duration-200 ease-out motion-reduce:transition-none"
          style={indicatorStyle}
        />
      )}
      {items.map((item) => {
        const isSelected = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onValueChange(item.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              'relative rounded-sm px-4 py-2 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
              isSelected
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
