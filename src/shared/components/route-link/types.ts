import type { ComponentProps } from 'react';
import type { Link } from 'react-router-dom';

export interface RouteLinkProps extends Omit<
  ComponentProps<typeof Link>,
  'color'
> {
  /** Defaults to the theme-aware link color. */
  color?: 'default' | 'foreground' | 'muted' | 'inherit';
  /** Hover also underlines on keyboard focus; none retains the focus outline. */
  underline?: 'always' | 'hover' | 'none';
}
