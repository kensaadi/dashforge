// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

function freshImport() {
  vi.resetModules();
  return Promise.all([
    import('./useComponentDefaults.js'),
    import('./useSlotProps.js'),
    import('./mergeSlotProps.js'),
    import('../store/tw-theme.store.js'),
    import('../store/tw-theme.actions.js'),
  ]).then(([cd, sp, ms, s, a]) => ({ ...cd, ...sp, ...ms, ...s, ...a }));
}

beforeEach(() => {
  localStorage.clear();
});

describe('useComponentDefaults', () => {
  it('returns undefined when the theme has no components config', async () => {
    const { useComponentDefaults } = await freshImport();
    const { result } = renderHook(() =>
      useComponentDefaults('Button' as never),
    );
    expect(result.current).toBeUndefined();
  });

  it('returns the configured entry after patchTheme injects components', async () => {
    const { useComponentDefaults, patchTheme } = await freshImport();
    const { result } = renderHook(() =>
      useComponentDefaults('Button' as never),
    );
    expect(result.current).toBeUndefined();

    await act(async () => {
      patchTheme({
        components: {
          Button: { defaults: { color: 'primary', variant: 'solid' } },
        } as never,
      });
    });

    expect(result.current).toEqual({
      defaults: { color: 'primary', variant: 'solid' },
    });
  });

  it('re-renders when a different component key is patched later', async () => {
    const { useComponentDefaults, patchTheme } = await freshImport();
    const { result } = renderHook(() =>
      useComponentDefaults('Card' as never),
    );

    await act(async () => {
      patchTheme({
        components: {
          Card: { defaults: { padding: 'lg' } },
        } as never,
      });
    });

    expect(result.current).toEqual({ defaults: { padding: 'lg' } });
  });
});

describe('useSlotProps', () => {
  it('returns undefined when no slotProps are configured for the component', async () => {
    const { useSlotProps } = await freshImport();
    const { result } = renderHook(() =>
      useSlotProps('DataGrid' as never, 'header' as never),
    );
    expect(result.current).toBeUndefined();
  });

  it('returns the configured slot entry after patchTheme injects slotProps', async () => {
    const { useSlotProps, patchTheme } = await freshImport();
    const { result } = renderHook(() =>
      useSlotProps('DataGrid' as never, 'header' as never),
    );

    await act(async () => {
      patchTheme({
        components: {
          DataGrid: {
            slotProps: {
              header: { className: 'bg-neutral-50 font-medium' },
              cell: { className: 'py-1.5 px-3' },
            },
          },
        } as never,
      });
    });

    expect(result.current).toEqual({ className: 'bg-neutral-50 font-medium' });
  });

  it('returns undefined for a slot not in the config even when the component IS configured', async () => {
    const { useSlotProps, patchTheme } = await freshImport();
    const { result } = renderHook(() =>
      useSlotProps('DataGrid' as never, 'footer' as never),
    );

    await act(async () => {
      patchTheme({
        components: {
          DataGrid: { slotProps: { header: { className: 'x' } } },
        } as never,
      });
    });

    expect(result.current).toBeUndefined();
  });
});

describe('mergeSlotProps', () => {
  it('returns empty object when both inputs are undefined', async () => {
    const { mergeSlotProps } = await freshImport();
    expect(mergeSlotProps(undefined, undefined)).toEqual({});
  });

  it('returns instanceProps when themeProps is undefined', async () => {
    const { mergeSlotProps } = await freshImport();
    expect(
      mergeSlotProps(undefined, { className: 'x', 'data-testid': 'y' } as Record<string, unknown>),
    ).toEqual({ className: 'x', 'data-testid': 'y' });
  });

  it('returns themeProps when instanceProps is undefined', async () => {
    const { mergeSlotProps } = await freshImport();
    expect(mergeSlotProps({ className: 'x' } as Record<string, unknown>, undefined)).toEqual({
      className: 'x',
    });
  });

  it('concatenates className between theme and instance (theme first)', async () => {
    const { mergeSlotProps } = await freshImport();
    expect(
      mergeSlotProps(
        { className: 'bg-neutral-50' } as Record<string, unknown>,
        { className: 'font-bold' } as Record<string, unknown>,
      ),
    ).toEqual({ className: 'bg-neutral-50 font-bold' });
  });

  it('concatenates sx between theme and instance (theme first)', async () => {
    const { mergeSlotProps } = await freshImport();
    expect(
      mergeSlotProps(
        { sx: 'text-red-500' } as Record<string, unknown>,
        { sx: 'font-bold' } as Record<string, unknown>,
      ),
    ).toEqual({ sx: 'text-red-500 font-bold' });
  });

  it('for non-className/sx props, instance wins over theme', async () => {
    const { mergeSlotProps } = await freshImport();
    expect(
      mergeSlotProps(
        { 'data-theme': 'a', 'aria-label': 'theme-label' } as Record<string, unknown>,
        { 'data-theme': 'b' } as Record<string, unknown>,
      ),
    ).toEqual({ 'data-theme': 'b', 'aria-label': 'theme-label' });
  });

  it('skips undefined values on instance side (does not clobber theme)', async () => {
    const { mergeSlotProps } = await freshImport();
    expect(
      mergeSlotProps(
        { 'data-x': 'kept' } as Record<string, unknown>,
        { 'data-x': undefined } as Record<string, unknown>,
      ),
    ).toEqual({ 'data-x': 'kept' });
  });

  it('does not mutate the inputs', async () => {
    const { mergeSlotProps } = await freshImport();
    const theme = { className: 'a' };
    const instance = { className: 'b' };
    mergeSlotProps(theme as Record<string, unknown>, instance as Record<string, unknown>);
    expect(theme).toEqual({ className: 'a' });
    expect(instance).toEqual({ className: 'b' });
  });
});
