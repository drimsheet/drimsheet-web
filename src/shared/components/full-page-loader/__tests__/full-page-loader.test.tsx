import { FullPageLoader } from '@/shared/components/full-page-loader';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('FullPageLoader', () => {
  it('announces the operation in progress', () => {
    render(<FullPageLoader label="Verifying your email" />);

    const status = screen.getByRole('status');

    expect(status).toHaveTextContent('Verifying your email');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('keeps the animated logo decorative', () => {
    render(<FullPageLoader label="Loading Drimsheet" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('disables the pulse animation when reduced motion is requested', () => {
    const { container } = render(<FullPageLoader label="Loading Drimsheet" />);

    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass(
      'motion-reduce:animate-none'
    );
  });
});
