import { AppSection } from '@/shared/components/app-section';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('AppSection', () => {
  it('uses the supplied title ID to name the section', () => {
    render(
      <AppSection title="Overview" titleId="overview">
        <p>Account balances</p>
      </AppSection>
    );
    const section = screen.getByRole('region', { name: 'Overview' });
    expect(section).toHaveAttribute('aria-labelledby', 'overview');
    expect(within(section).getByRole('heading', { level: 2 })).toHaveAttribute(
      'id',
      'overview'
    );
  });

  it('names the section with its level-two heading', () => {
    render(
      <AppSection title="Overview">
        <p>Account balances</p>
      </AppSection>
    );
    const section = screen.getByRole('region', { name: 'Overview' });
    expect(
      within(section).getByRole('heading', { level: 2, name: 'Overview' })
    ).toBeVisible();
    expect(within(section).getByText('Account balances')).toBeVisible();
  });

  it('renders untitled content without an empty heading or invalid label', () => {
    render(
      <AppSection data-testid="section">
        <p>Account balances</p>
      </AppSection>
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByTestId('section')).not.toHaveAttribute(
      'aria-labelledby'
    );
    expect(screen.getByText('Account balances')).toBeVisible();
  });

  it('gives repeated titles distinct accessible heading references', () => {
    render(
      <>
        <AppSection title="Overview" />
        <AppSection title="Overview" />
      </>
    );
    const sections = screen.getAllByRole('region', { name: 'Overview' });
    const headings = screen.getAllByRole('heading', { name: 'Overview' });
    expect(headings[0].id).not.toBe(headings[1].id);
    sections.forEach((section, index) =>
      expect(section).toHaveAttribute('aria-labelledby', headings[index].id)
    );
  });

  it('preserves an explicit accessible name', () => {
    render(<AppSection title="Your entities · 2" aria-label="Your entities" />);
    const section = screen.getByRole('region', { name: 'Your entities' });
    expect(section).not.toHaveAttribute('aria-labelledby');
    expect(
      within(section).getByRole('heading', {
        level: 2,
        name: 'Your entities · 2',
      })
    ).toBeVisible();
  });
});
