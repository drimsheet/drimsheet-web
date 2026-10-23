import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import * as stories from '@/shared/components/alert/__stories__/alert.stories';
import { composeStories } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const { Default, Destructive, Success, Info, Warning } =
  composeStories(stories);

describe('Alert', () => {
  it('renders default variant correctly', () => {
    render(<Default />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-card', 'text-card-foreground');
    expect(screen.getByText('Heads up!')).toBeInTheDocument();
  });

  it('renders destructive variant correctly', () => {
    render(<Destructive />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-destructive-surface', 'text-destructive');
  });

  it('renders success variant correctly', () => {
    render(<Success />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-success-surface', 'text-success');
  });

  it('renders info variant correctly', () => {
    render(<Info />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-info-surface', 'text-info');
  });

  it('renders warning variant correctly', () => {
    render(<Warning />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-warning-surface', 'text-warning');
  });

  it('renders AlertTitle and AlertDescription', () => {
    render(
      <Alert>
        <AlertTitle>Custom Title</AlertTitle>
        <AlertDescription>Custom Description</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Description')).toBeInTheDocument();
  });
});
