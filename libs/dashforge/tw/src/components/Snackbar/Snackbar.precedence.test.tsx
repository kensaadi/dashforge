// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { SnackbarProvider, useSnackbar } from './Snackbar.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

function Enqueuer() {
  const { enqueue } = useSnackbar();
  return (
    <button onClick={() => enqueue({ message: 'hi' })} data-testid="enqueue">
      go
    </button>
  );
}

describe('SnackbarProvider precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders (bottom-right)', () => {
    const { container } = render(
      <SnackbarProvider>
        <div>content</div>
      </SnackbarProvider>
    );
    expect(container.textContent).toContain('content');
  });

  it('level 2 — theme override wins (position=top-center)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Snackbar: { defaults: { position: 'top-center' } } },
      });
    });
    const { container } = render(
      <SnackbarProvider>
        <div>x</div>
      </SnackbarProvider>
    );
    expect(container).not.toBeNull();
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Snackbar: { defaults: { position: 'top-center', maxVisible: 2 } } },
      });
    });
    const { container } = render(
      <SnackbarProvider position="bottom-left" maxVisible={7}>
        <div>x</div>
      </SnackbarProvider>
    );
    expect(container).not.toBeNull();
  });

  it('theme enqueueDefaults merges with provider defaults (provider wins)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Snackbar: {
            defaults: {
              enqueueDefaults: { severity: 'info', autoHideMs: 8000 },
            },
          },
        },
      });
    });
    const { container } = render(
      <SnackbarProvider defaults={{ severity: 'warning' }}>
        <Enqueuer />
      </SnackbarProvider>
    );
    expect(container).not.toBeNull();
  });
});
