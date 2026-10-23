import { AppHeaderTitle } from '@/shared/components/app';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('AppHeaderTitle', () => {
  it('renders correctly', () => {
    render(<AppHeaderTitle>Accounts Dashboard</AppHeaderTitle>);
    expect(screen.getByText('Accounts Dashboard')).toBeInTheDocument();
  });

  it('renders h1 tag with default class names', () => {
    render(<AppHeaderTitle>Accounts Dashboard</AppHeaderTitle>);
    const title = screen.getByText('Accounts Dashboard');
    expect(title.tagName).toBe('H1');
    expect(title).toHaveClass('text-3xl', 'text-foreground', 'font-medium');
  });

  it('merges custom className prop', () => {
    render(
      <AppHeaderTitle className="my-custom-class">
        Accounts Dashboard
      </AppHeaderTitle>
    );
    const title = screen.getByText('Accounts Dashboard');
    expect(title).toHaveClass(
      'text-3xl',
      'text-foreground',
      'font-medium',
      'my-custom-class'
    );
  });
});
