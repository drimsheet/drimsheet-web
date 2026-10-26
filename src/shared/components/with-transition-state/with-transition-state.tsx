import type { WithTransitionStateProps } from './types';

export function WithTransitionState<TData>(
  props: Readonly<WithTransitionStateProps<TData>>
) {
  if (props.state === 'loading') {
    return props.loading;
  }

  if (props.state === 'error') {
    return props.error;
  }

  return props.children(props.data);
}
