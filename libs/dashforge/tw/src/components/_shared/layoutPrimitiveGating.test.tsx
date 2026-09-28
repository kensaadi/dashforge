// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import { Stack } from '../Stack/Stack.js';
import { Grid } from '../Grid/Grid.js';

void React;
afterEach(() => cleanup());

/**
 * kensaadi/dashforge#137 — `access` + `visibleWhen` on `<Stack>` and
 * `<Grid>`, for parity with `<Box>`, which has carried both since 1.1.0.
 *
 * The pair is run against BOTH components from one table, because the
 * failure mode worth guarding is not any single component's markup: it is
 * that the two were retrofitted by copying `<Box>` and one copy drifted.
 * Shared logic in this repo is duplicated by hand across renderers, and a
 * grep on imports does not find the copies (BUG 17 was declared closed on
 * all of them while the tw copy was untouched, and came back ten days
 * later as BUG 32 across fourteen components).
 *
 * The first case is the regression guard the whole retrofit rests on:
 * a consumer who passes neither prop must render exactly as before.
 */

const POLICY: RbacPolicy = {
  roles: [
    {
      name: 'viewer',
      permissions: [
        { resource: 'panel', action: 'read', effect: 'allow' },
        { resource: 'panel', action: 'edit', effect: 'deny' },
      ],
    },
  ],
};
const viewer: Subject = { id: 'v', roles: ['viewer'] };

const withRbac = (ui: React.ReactNode) =>
  render(
    <RbacProvider policy={POLICY} subject={viewer}>
      {ui}
    </RbacProvider>
  );

/** Each entry renders the component with arbitrary extra props applied. */
const PRIMITIVES: ReadonlyArray<{
  name: string;
  render: (extra: Record<string, unknown>) => React.ReactElement;
}> = [
  {
    name: 'Stack',
    render: (extra) => (
      <Stack direction="row" gap={2} {...extra}>
        <span>child</span>
      </Stack>
    ),
  },
  {
    name: 'Grid (container)',
    render: (extra) => (
      <Grid container cols={12} {...extra}>
        <span>child</span>
      </Grid>
    ),
  },
  {
    name: 'Grid (item)',
    render: (extra) => (
      <Grid xs={6} {...extra}>
        <span>child</span>
      </Grid>
    ),
  },
];

describe.each(PRIMITIVES)('<$name> gating', ({ render: renderIt }) => {
  it('renders identically when neither prop is passed', () => {
    const before = render(renderIt({})).container.innerHTML;
    cleanup();
    const after = withRbac(renderIt({})).container.innerHTML;

    // Byte-for-byte: the retrofit must be invisible to every existing
    // consumer, inside an RBAC provider or outside one.
    expect(after).toBe(before);
    expect(after).toContain('child');
  });

  it('renders null when visibleWhen returns false', () => {
    const { container } = render(renderIt({ visibleWhen: () => false }));
    expect(container.innerHTML).toBe('');
  });

  it('renders when visibleWhen returns true', () => {
    const { container } = render(renderIt({ visibleWhen: () => true }));
    expect(container.textContent).toContain('child');
  });

  it('hides on a denied access requirement', () => {
    const { container } = withRbac(
      renderIt({
        access: { resource: 'panel', action: 'edit', onUnauthorized: 'hide' },
      })
    );
    expect(container.innerHTML).toBe('');
  });

  it('still renders on an allowed access requirement', () => {
    const { container } = withRbac(
      renderIt({
        access: { resource: 'panel', action: 'read', onUnauthorized: 'hide' },
      })
    );
    expect(container.textContent).toContain('child');
  });

  it('dims and marks aria-disabled when denied with disable', () => {
    const { container } = withRbac(
      renderIt({
        access: { resource: 'panel', action: 'edit', onUnauthorized: 'disable' },
      })
    );
    const root = container.firstElementChild!;

    expect(root.getAttribute('aria-disabled')).toBe('true');
    expect(root.getAttribute('data-disabled')).toBe('true');
    expect(root.className).toContain('opacity-60');
    // Disabled is not hidden: the content stays readable.
    expect(container.textContent).toContain('child');
  });

  it('marks aria-readonly when denied with readonly', () => {
    const { container } = withRbac(
      renderIt({
        access: { resource: 'panel', action: 'edit', onUnauthorized: 'readonly' },
      })
    );
    const root = container.firstElementChild!;

    expect(root.getAttribute('aria-readonly')).toBe('true');
    expect(root.className).toContain('opacity-80');
  });

  it('leaks neither prop onto the DOM element', () => {
    // `<Grid>` sanitises its own role props out of the spread by hand, so
    // a new prop that is not destructured lands on the node as an unknown
    // attribute. React 19 passes lowercase unknown attrs through in
    // silence, which is how `tooltip` once shipped onto the DOM (BUG 9).
    const { container } = render(
      renderIt({ visibleWhen: () => true, access: undefined })
    );
    const root = container.firstElementChild!;

    expect(root.hasAttribute('visiblewhen')).toBe(false);
    expect(root.hasAttribute('access')).toBe(false);
  });

  it('survives visibleWhen flipping across renders', () => {
    // The hook-count trap: subscribing conditionally is what made a
    // `visibleWhen` that appears or disappears white-screen the app
    // (BUG 33). Both hooks sit above the early return, so the count is
    // constant and this sequence must not throw.
    const { container, rerender } = render(renderIt({ visibleWhen: () => true }));
    expect(container.textContent).toContain('child');

    rerender(renderIt({ visibleWhen: () => false }));
    expect(container.innerHTML).toBe('');

    rerender(renderIt({ visibleWhen: () => true }));
    expect(container.textContent).toContain('child');

    rerender(renderIt({}));
    expect(container.textContent).toContain('child');
  });
});
