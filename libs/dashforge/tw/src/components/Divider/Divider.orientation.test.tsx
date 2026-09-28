// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Divider } from './Divider';

void React;
afterEach(() => cleanup());

/**
 * Regression guard for BUG 25 in libs/dashforge/README-BUG.md.
 *
 * `segment: 'full'` emitted an unconditional `w-full`, while the
 * orientation axis emitted `w-0` for vertical. tailwind-merge keeps the
 * later of two conflicting width utilities, so `w-full` won and every
 * vertical line-only divider rendered as a full-width bar with a left
 * border. Measured on the served page: 576.95px wide inside a flex row.
 *
 * `full` means "span the divider's own main axis", which is the width for
 * a horizontal rule and the height for a vertical one, so it moved to
 * `compoundVariants`.
 *
 * These assert the CLASS CONTRACT. jsdom does no layout, so the geometry
 * was verified separately in Chrome against `learn/dash`; the numbers are
 * recorded in the register entry.
 */

/** The single element rendered in line-only mode. */
function lineOf(container: HTMLElement) {
  const el = container.firstElementChild as HTMLElement;
  return { el, cls: el.className.split(/\s+/).filter(Boolean) };
}

describe('BUG 25 regression guard — `segment: full` is orientation-aware', () => {
  it('a vertical line-only divider emits no width-spanning utility', () => {
    const { container } = render(<Divider orientation="vertical" />);
    const { cls } = lineOf(container);

    // The defect, stated as the thing that must never come back.
    expect(cls).not.toContain('w-full');

    // And what has to stay: the 1px comes from the border, the span from
    // `self-stretch`. Dropping either re-opens this from a different side.
    expect(cls).toContain('w-0');
    expect(cls).toContain('border-l');
    expect(cls).toContain('self-stretch');

    // `h-full` is NOT the fix: a definite height suppresses
    // `align-self: stretch` and then resolves to 0 against an
    // auto-height flex parent. Measured 1px x 0px in Chrome.
    expect(cls).not.toContain('h-full');
  });

  it('a horizontal line-only divider keeps `w-full`, which is load-bearing', () => {
    // A block child does not fill the width once it is a flex item, so
    // removing this would collapse the rule in exactly the toolbar case
    // that BUG 25 came from.
    const { container } = render(<Divider orientation="horizontal" />);
    const { cls } = lineOf(container);

    expect(cls).toContain('w-full');
    expect(cls).toContain('border-t');
    expect(cls).not.toContain('h-full');
  });

  it('`orientation` is the only thing that decides which axis spans', () => {
    // Same props, both orientations, nothing else in play.
    const h = render(<Divider orientation="horizontal" />);
    const hCls = lineOf(h.container).cls;
    cleanup();
    const v = render(<Divider orientation="vertical" />);
    const vCls = lineOf(v.container).cls;

    expect(hCls).toContain('w-full');
    expect(vCls).not.toContain('w-full');
  });

  it('labeled mode still uses `grow`, which needs no orientation compound', () => {
    // `flex-1` grows along whichever main axis the parent sets, so the
    // labeled path was never affected and must not regress into one.
    const { container } = render(<Divider orientation="vertical">or</Divider>);
    const segments = container.querySelectorAll('span');
    expect(segments.length).toBeGreaterThan(0);

    segments.forEach((sp) => {
      const cls = sp.className.split(/\s+/);
      if (cls.includes('flex-1')) {
        expect(cls).not.toContain('w-full');
        expect(cls).toContain('w-0');
      }
    });
  });

  it('`sx` no longer needs a width to beat a width', () => {
    // The downstream workaround was `sx="w-px h-5 mx-1"`, where `w-px`
    // existed only to out-specify `w-full`. A plain height must now be
    // enough, and must survive the merge.
    const { container } = render(<Divider orientation="vertical" sx="h-5 mx-1" />);
    const { cls } = lineOf(container);

    expect(cls).toContain('h-5');
    expect(cls).toContain('mx-1');
    expect(cls).not.toContain('w-full');
  });
});
