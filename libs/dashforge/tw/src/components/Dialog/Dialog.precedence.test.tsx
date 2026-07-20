// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Dialog } from './Dialog.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Dialog precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders (size=md)', () => {
    render(
      <Dialog open onOpenChange={() => {}} title="T">
        Body
      </Dialog>
    );
    const content = document.querySelector('[role="dialog"]');
    expect(content?.className).toMatch(/max-w-md/);
  });

  it('level 2 — theme override wins (size=lg)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Dialog: { defaults: { size: 'lg' } } },
      });
    });
    render(
      <Dialog open onOpenChange={() => {}} title="T">
        Body
      </Dialog>
    );
    const content = document.querySelector('[role="dialog"]');
    expect(content?.className).toMatch(/max-w-2xl/);
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Dialog: { defaults: { size: 'lg' } } },
      });
    });
    render(
      <Dialog open onOpenChange={() => {}} title="T" size="sm">
        Body
      </Dialog>
    );
    const content = document.querySelector('[role="dialog"]');
    expect(content?.className).toMatch(/max-w-sm/);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    render(
      <Dialog open onOpenChange={() => {}} title="T" sx="bg-yellow-100">
        Body
      </Dialog>
    );
    const content = document.querySelector('[role="dialog"]');
    expect(content?.className).toMatch(/bg-yellow-100/);
  });

  it('theme showCloseButton=false hides the close button', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Dialog: { defaults: { showCloseButton: false } } },
      });
    });
    render(
      <Dialog open onOpenChange={() => {}} title="T">
        Body
      </Dialog>
    );
    const closeBtn = document.querySelector('[aria-label="Close"]');
    expect(closeBtn).toBeNull();
  });

  it('slotProps precedence — instance slotProps merged onto content', () => {
    render(
      <Dialog
        open
        onOpenChange={() => {}}
        title="T"
        slotProps={{ content: { className: 'df-slot-content-token' } }}
      >
        Body
      </Dialog>
    );
    const content = document.querySelector('.df-slot-content-token');
    expect(content).toBeTruthy();
  });

  it('slotProps precedence — instance slotProps merged onto title slot', () => {
    render(
      <Dialog
        open
        onOpenChange={() => {}}
        title="T"
        slotProps={{ title: { className: 'df-slot-title-token' } }}
      >
        Body
      </Dialog>
    );
    const title = document.querySelector('.df-slot-title-token');
    expect(title).toBeTruthy();
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Dialog: { defaults: { size: 'lg' } } },
      });
    });
    render(
      <Dialog open onOpenChange={() => {}} title="T">
        Body
      </Dialog>
    );
    const content = document.querySelector('[role="dialog"]');
    expect(content?.getAttribute('size')).toBeNull();
  });
});
