import {
  WithTransitionState,
  type WithTransitionStateProps,
} from '@/shared/components/with-transition-state';
import { render, screen } from '@testing-library/react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

describe('WithTransitionState', () => {
  it.each(['loading', 'error'] as const)(
    'renders only the %s slot without evaluating success content',
    (state) => {
      const children = vi.fn(() => {
        throw new Error('Success content must not be evaluated');
      });

      render(
        <WithTransitionState
          state={state}
          loading={<p>Loading slot</p>}
          error={<p>Error slot</p>}
        >
          {children}
        </WithTransitionState>
      );

      expect(
        screen.getByText(state === 'loading' ? 'Loading slot' : 'Error slot')
      ).toBeVisible();
      expect(
        screen.queryByText(state === 'loading' ? 'Error slot' : 'Loading slot')
      ).not.toBeInTheDocument();
      expect(children).not.toHaveBeenCalled();
    }
  );

  it.each([undefined, 'success'] as const)(
    'renders success data with state %s, including zero values',
    (state) => {
      render(
        <WithTransitionState
          state={state}
          data={0}
          loading={<p>Loading slot</p>}
          error={<p>Error slot</p>}
        >
          {(data) => {
            expectTypeOf(data).toEqualTypeOf<number>();

            return <p>Balance: {data}</p>;
          }}
        </WithTransitionState>
      );

      expect(screen.getByText('Balance: 0')).toBeVisible();
      expect(screen.queryByText('Loading slot')).not.toBeInTheDocument();
      expect(screen.queryByText('Error slot')).not.toBeInTheDocument();
    }
  );

  it('replaces loading and error slots with successful content as props change', () => {
    const slots = {
      loading: <p>Loading slot</p>,
      error: <p>Error slot</p>,
      children: (data: { name: string }) => <p>{data.name}</p>,
    };

    const { rerender } = render(
      <WithTransitionState state="loading" {...slots} />
    );

    expect(screen.getByText('Loading slot')).toBeVisible();

    rerender(<WithTransitionState state="error" {...slots} />);
    expect(screen.getByText('Error slot')).toBeVisible();
    expect(screen.queryByText('Loading slot')).not.toBeInTheDocument();

    rerender(<WithTransitionState data={{ name: 'Ready' }} {...slots} />);
    expect(screen.getByText('Ready')).toBeVisible();
    expect(screen.queryByText('Error slot')).not.toBeInTheDocument();
  });

  it('requires defined data for explicit and default success', () => {
    type TProps = WithTransitionStateProps<{ name: string }>;

    type TSlots = Pick<TProps, 'loading' | 'error' | 'children'>;

    expectTypeOf<TSlots>().not.toExtend<TProps>();
    expectTypeOf<
      TSlots & { state: 'success'; data: undefined }
    >().not.toExtend<TProps>();
    expectTypeOf<
      TSlots & { state: 'success'; data: null }
    >().not.toExtend<TProps>();
  });
});
