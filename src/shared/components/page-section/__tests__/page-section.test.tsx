import {
  PageSection,
  PageSectionTitle,
} from '@/shared/components/page-section';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('PageSection', () => {
  it('allows a page heading before a composed section title without duplicating headings', () => {
    render(
      <PageSection aria-labelledby="overview">
        <h1>Main account</h1>
        <PageSectionTitle id="overview">Overview</PageSectionTitle>
        <p>Account balances</p>
      </PageSection>
    );
    const section = screen.getByRole('region', { name: 'Overview' });
    const headings = within(section).getAllByRole('heading');
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveAccessibleName('Main account');
    expect(headings[0].tagName).toBe('H1');
    expect(headings[1]).toHaveAccessibleName('Overview');
    expect(headings[1].tagName).toBe('H2');
  });

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

  it('preserves an explicit accessible name', () => {
    render(
      <PageSection title="Your entities · 2" aria-label="Your entities" />
    );
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
