import type { StepLayoutProps } from '../types';

export function StepLayout({
  titleId,
  children,
  actions,
}: Readonly<StepLayoutProps>) {
  return (
    <section aria-labelledby={titleId} className="flex w-full flex-1 flex-col">
      <div
        data-slot="onboarding-step-content"
        className="flex-1 px-6 pb-8 sm:px-8 lg:px-10"
      >
        <div className="w-full max-w-[620px]">{children}</div>
      </div>
      <footer className="sticky bottom-0 z-10 shrink-0 bg-background px-6 py-6 sm:px-8 lg:px-10">
        <div className="flex w-full max-w-[620px] flex-wrap items-center justify-between gap-3">
          {actions}
        </div>
      </footer>
    </section>
  );
}
