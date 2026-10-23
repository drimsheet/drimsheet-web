import { BrandLogo } from '@/shared/components/brand-logo';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('BrandLogo', () => {
  it('announces the brand once across the two theme images', () => {
    render(<BrandLogo alt="Drimsheet" />);

    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'Drimsheet' })).toBeInTheDocument();
  });

  it('keeps the mark decorative when its parent provides the label', () => {
    render(<BrandLogo variant="mark" alt="" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
