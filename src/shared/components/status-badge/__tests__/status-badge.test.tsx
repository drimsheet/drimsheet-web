import * as stories from '@/shared/components/status-badge/__stories__/status-badge.stories';
import { composeStories } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const {
  Success,
  Info,
  Warning,
  Error,
  Neutral,
  Primary,
  Secondary,
  WithoutDot,
  WithDot,
} = composeStories(stories);

describe('StatusBadge', () => {
  it('renders correctly with label text', () => {
    render(<Success />);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('omits the dot indicator by default', () => {
    render(<Neutral />);
    expect(screen.getByText('Neutral')).toBeInTheDocument();
    expect(screen.queryByTestId('status-badge-dot')).not.toBeInTheDocument();
  });

  it('supports an explicitly requested decorative dot', () => {
    render(<WithDot />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge-dot')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('renders all variants with correct classes', () => {
    const variants = [
      {
        Component: Success,
        name: 'Success',
        bg: 'bg-lozenge-success',
        text: 'text-success',
      },
      {
        Component: Info,
        name: 'Info',
        bg: 'bg-lozenge-info',
        text: 'text-info',
      },
      {
        Component: Warning,
        name: 'Warning',
        bg: 'bg-lozenge-warning',
        text: 'text-warning',
      },
      {
        Component: Error,
        name: 'Error',
        bg: 'bg-lozenge-error',
        text: 'text-error',
      },
      {
        Component: Neutral,
        name: 'Neutral',
        bg: 'bg-lozenge-neutral',
        text: 'text-lozenge-neutral-foreground',
      },
      {
        Component: Primary,
        name: 'Primary',
        bg: 'bg-primary',
        text: 'text-primary-foreground',
      },
      {
        Component: Secondary,
        name: 'Secondary',
        bg: 'bg-secondary',
        text: 'text-secondary-foreground',
      },
    ] as const;

    for (const { Component, name, bg, text } of variants) {
      const { rerender } = render(<Component />);
      const badge = screen.getByText(name);
      expect(badge).toHaveClass(bg, text);
      rerender(<></>); // clean up between iterations
    }
  });

  it('does not render dot when showDot is false', () => {
    render(<WithoutDot />);
    expect(screen.queryByTestId('status-badge-dot')).not.toBeInTheDocument();
  });

  it('merges custom className prop correctly', () => {
    render(<Neutral className="custom-status-class" />);
    const badge = screen.getByText('Neutral');
    expect(badge).toHaveClass('custom-status-class');
  });
});
