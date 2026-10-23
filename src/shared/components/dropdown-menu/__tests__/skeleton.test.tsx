import * as stories from '@/shared/components/dropdown-menu/__stories__/skeleton.stories';
import { composeStories } from '@storybook/react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const { Default } = composeStories(stories);

describe('DropdownMenuItemSkeleton', () => {
  it('announces loading separately from the disabled menu item layout', () => {
    render(<Default />);

    const label = 'Checking deletion eligibility';
    const item = screen.getByRole('menuitem', { name: label });
    const announcement = within(item).getByRole('status', { name: label });

    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(item).toHaveAttribute('aria-busy', 'true');
    expect(announcement.tagName).toBe('OUTPUT');
    expect(announcement).toHaveClass('sr-only');
    expect(announcement).toHaveTextContent(label);
    expect(announcement.children).toHaveLength(0);
    expect(announcement).not.toHaveAttribute('role');
  });
});
