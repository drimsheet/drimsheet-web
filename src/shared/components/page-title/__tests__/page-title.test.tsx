import { PageTitle } from '@/shared/components/page-title';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('PageTitle', () => {
  it('renders correctly', () => {
    render(<PageTitle>Accounts Dashboard</PageTitle>);
    expect(screen.getByText('Accounts Dashboard')).toBeInTheDocument();
  });

  it('renders h1 tag with default class names', () => {
    render(<PageTitle>Accounts Dashboard</PageTitle>);
    const title = screen.getByText('Accounts Dashboard');
    expect(title.tagName).toBe('H1');
    expect(title).toHaveClass('text-[28px]', 'text-foreground', 'font-medium');
  });

  it('merges custom className prop', () => {
    render(
      <PageTitle className="my-custom-class">Accounts Dashboard</PageTitle>
    );
    const title = screen.getByText('Accounts Dashboard');
    expect(title).toHaveClass(
      'text-[28px]',
      'text-foreground',
      'font-medium',
      'my-custom-class'
    );
  });
});
