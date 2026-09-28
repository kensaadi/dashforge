// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { Chip } from './Chip.js';

void React;
afterEach(() => cleanup());

/**
 * kensaadi/dashforge#63 gap A asked for an inline status-pill mode on
 * `<Badge>` (✓ valid / ⚠ N issues / ● modified), on the grounds that the
 * `<Chip>` workaround is "semantically a filter chip".
 *
 * It is not. A `<Chip>` with no handlers carries no interactive semantics
 * at all, and `badge.types.ts` documents the split it was being asked to
 * break: Badge is the anchored indicator, Chip is the standalone pill.
 *
 * These cases pin the property the whole boundary rests on. If a
 * handler-less Chip ever starts emitting a role or a tab stop, every status
 * pill built on it starts announcing itself as a control that does nothing,
 * and the answer given on that issue stops being true.
 */
describe('<Chip> as a passive status pill', () => {
  it('renders an inert span when no handler is passed', () => {
    const { container } = render(
      <Chip label="valid" variant="soft" color="success" />
    );
    const el = container.firstElementChild!;

    expect(el.tagName).toBe('SPAN');
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('tabindex')).toBe(false);
    expect(el.textContent).toContain('valid');
  });

  it('is absent from the accessibility tree as a control', () => {
    render(<Chip label="modified" variant="soft" color="warning" />);

    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('carries a leading icon, which is what a status pill needs', () => {
    const { container } = render(
      <Chip
        label="3 issues"
        variant="soft"
        color="warning"
        icon={<span data-testid="glyph">!</span>}
      />
    );

    expect(screen.getByTestId('glyph')).toBeTruthy();
    expect(container.textContent).toContain('3 issues');
  });

  it('becomes a control only when it is given something to do', () => {
    // The contrast that makes the first case meaningful.
    const { container } = render(
      <Chip label="filter" onClick={() => undefined} />
    );
    const el = container.firstElementChild!;

    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('tabindex')).toBe('0');
  });
});
