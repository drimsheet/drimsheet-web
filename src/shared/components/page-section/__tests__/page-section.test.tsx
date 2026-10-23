import { PageSection } from '@/shared/components/page-section';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('PageSection', () => {
  it('names the section with its level-two heading', () => {
    render(
      <PageSection title="Overview">
        <p>Account balances</p>
      </PageSection>
    );
    const section = screen.getByRole('region', { name: 'Overview' });
    expect(
      within(section).getByRole('heading', { level: 2, name: 'Overview' })
    ).toBeVisible();
    expect(within(section).getByText('Account balances')).toBeVisible();
  });

  it('renders untitled content without an empty heading or invalid label', () => {
    render(
      <PageSection data-testid="section">
        <p>Account balances</p>
      </PageSection>
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
        <PageSection title="Overview" />
        <PageSection title="Overview" />
      </>
    );
    const sections = screen.getAllByRole('region', { name: 'Overview' });
    const headings = screen.getAllByRole('heading', { name: 'Overview' });
    expect(headings[0].id).not.toBe(headings[1].id);
    sections.forEach((section, index) =>
      expect(section).toHaveAttribute('aria-labelledby', headings[index].id)
    );
  });

  it('preserves an explicit accessible name and adjacent controls', () => {
    render(
      <PageSection
        title="Your entities · 2"
        aria-label="Your entities"
        actions={<button>Add entity</button>}
        titleAdornment={<button>About entities</button>}
      />
    );
    const section = screen.getByRole('region', { name: 'Your entities' });
    expect(
      within(section).getByRole('button', { name: 'Add entity' })
    ).toBeVisible();
    expect(
      within(section).getByRole('button', { name: 'About entities' })
    ).toBeVisible();
  });
});
