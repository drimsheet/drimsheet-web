import type { CategoryChartsProps } from '../types';

export function CategoryCharts({ children }: Readonly<CategoryChartsProps>) {
  return (
    <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      {children}
    </div>
  );
}
