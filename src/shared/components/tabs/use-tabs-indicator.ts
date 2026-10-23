import type { CSSProperties } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { TabsProps } from './types';

export function useTabsIndicator({
  items,
  value,
}: Pick<TabsProps, 'items' | 'value'>) {
  const tabListRef = useRef<HTMLDivElement>(null);

  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties | null>(
    null
  );

  useLayoutEffect(() => {
    const tabList = tabListRef.current;

    if (!tabList) {
      return;
    }

    // Track every tab: resizing an earlier label also moves the selected tab.
    const tabs = tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]');

    const measureIndicator = () => {
      const selectedTab = tabList.querySelector<HTMLButtonElement>(
        '[aria-selected="true"]'
      );

      if (!selectedTab || selectedTab.offsetWidth === 0) {
        setIndicatorStyle(null);

        return;
      }

      setIndicatorStyle({
        transform: `translate(${selectedTab.offsetLeft}px, ${selectedTab.offsetTop}px)`,
        width: selectedTab.offsetWidth,
        height: selectedTab.offsetHeight,
      });
    };

    measureIndicator();

    const observer = new ResizeObserver(measureIndicator);
    observer.observe(tabList);
    tabs.forEach((tab) => observer.observe(tab));

    return () => observer.disconnect();
  }, [items, value]);

  return { tabListRef, indicatorStyle };
}
