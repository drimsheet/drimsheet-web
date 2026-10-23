import { RouteLink } from '@/shared/components/route-link';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { expect, it } from 'vitest';

it('navigates with keyboard activation and preserves router state', async () => {
  const user = userEvent.setup();

  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <RouteLink to="/entities" state={{ from: 'home' }}>
          Legal entities
        </RouteLink>
      ),
    },
    { path: '/entities', element: <h1>Entities</h1> },
  ]);

  render(<RouterProvider router={router} />);
  await user.tab();
  expect(screen.getByRole('link', { name: 'Legal entities' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(
    await screen.findByRole('heading', { name: 'Entities' })
  ).toBeVisible();
  expect(router.state.location.state).toEqual({ from: 'home' });
});

it('forwards anchor props and refs and respects a prevented click', async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLAnchorElement>();

  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <RouteLink
          ref={ref}
          to="/entities"
          target="_self"
          rel="noopener noreferrer"
          aria-label="Open legal entities"
          underline="none"
          color="foreground"
          onClick={(event) => event.preventDefault()}
        >
          Entities
        </RouteLink>
      ),
    },
  ]);

  render(<RouterProvider router={router} />);
  const link = screen.getByRole('link', { name: 'Open legal entities' });

  expect(ref.current).toBe(link);
  expect(link).toHaveAttribute('href', '/entities');
  expect(link).toHaveAttribute('target', '_self');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  await user.click(link);
  expect(router.state.location.pathname).toBe('/');
});
