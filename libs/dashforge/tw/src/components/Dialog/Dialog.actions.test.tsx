// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Dialog } from './Dialog.js';

void React;
afterEach(() => cleanup());

/**
 * Regression tests for BUG 6 in libs/dashforge/README-BUG.md — the
 * `actions` slot was styled (`dialog.variants.ts:52`) and typed
 * (`dialog.types.ts:35 DialogSlotProps.actions`) but never rendered.
 * The prop is now honoured; these tests pin it.
 */

describe('<Dialog> — actions footer slot (BUG 6 fix)', () => {
  it('renders no actions row when the `actions` prop is omitted', () => {
    render(
      <Dialog open onOpenChange={() => undefined} title="Test">
        Body content
      </Dialog>,
    );
    // The variant `actions` slot uses `flex justify-end gap-2 pt-2` — a
    // consumer can't grep for those classes safely, so we assert on
    // presence via the button that lives inside it in the "with actions"
    // test below. Here we assert simple absence: no element in the
    // dialog subtree has the recognisable action-bar class combination
    // `justify-end` (no other slot uses it).
    const dialogContent = document.querySelector('[role="dialog"]');
    expect(dialogContent).toBeTruthy();
    const actionsRow = dialogContent!.querySelector('[class*="justify-end"]');
    expect(actionsRow).toBeNull();
  });

  it('renders the `actions` node as a footer row when provided', () => {
    render(
      <Dialog
        open
        onOpenChange={() => undefined}
        title="Test"
        actions={
          <>
            <button type="button" data-testid="cancel">Cancel</button>
            <button type="button" data-testid="save">Save</button>
          </>
        }
      >
        Body content
      </Dialog>,
    );
    const cancel = screen.getByTestId('cancel');
    const save = screen.getByTestId('save');
    expect(cancel).toBeTruthy();
    expect(save).toBeTruthy();

    // Both action buttons share the same immediate parent — the
    // footer row — and that parent carries the design-system's
    // `justify-end` alignment class (from `v.actions()`).
    expect(cancel.parentElement).toBe(save.parentElement);
    expect(cancel.parentElement?.className).toMatch(/justify-end/);
  });

  it('applies `slotProps.actions.className` to the footer row', () => {
    render(
      <Dialog
        open
        onOpenChange={() => undefined}
        title="Test"
        actions={<button type="button" data-testid="ok">OK</button>}
        slotProps={{ actions: { className: 'probe-actions-class' } }}
      >
        Body
      </Dialog>,
    );
    const button = screen.getByTestId('ok');
    expect(button.parentElement?.className).toMatch(/probe-actions-class/);
  });
});
