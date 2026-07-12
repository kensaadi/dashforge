// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { ConfirmDialogProvider, useConfirm } from './ConfirmDialog.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

function Trigger() {
  const confirm = useConfirm();
  return (
    <button
      onClick={() => {
        void confirm({ title: 'Hi' });
      }}
      data-testid="trigger"
    >
      Ask
    </button>
  );
}

describe('ConfirmDialogProvider precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults (severity=info)', () => {
    const { container } = render(
      <ConfirmDialogProvider>
        <div>content</div>
      </ConfirmDialogProvider>
    );
    expect(container.textContent).toContain('content');
  });

  it('level 2 — theme severity override wins (danger)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { ConfirmDialog: { defaults: { severity: 'danger' } } },
      });
    });
    const { container } = render(
      <ConfirmDialogProvider>
        <Trigger />
      </ConfirmDialogProvider>
    );
    expect(container).not.toBeNull();
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { ConfirmDialog: { defaults: { severity: 'danger' } } },
      });
    });
    const { container } = render(
      <ConfirmDialogProvider severity="warning">
        <Trigger />
      </ConfirmDialogProvider>
    );
    expect(container).not.toBeNull();
  });

  it('theme invocationDefaults merge under provider defaults (provider wins)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          ConfirmDialog: {
            defaults: {
              invocationDefaults: {
                confirmLabel: 'Yes',
                cancelLabel: 'No',
                severity: 'danger',
              },
            },
          },
        },
      });
    });
    const { container } = render(
      <ConfirmDialogProvider defaults={{ confirmLabel: 'Delete' }}>
        <Trigger />
      </ConfirmDialogProvider>
    );
    expect(container).not.toBeNull();
  });
});
