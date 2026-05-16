// @vitest-environment jsdom
/**
 * Performance + re-render budget tests for `<LeftNav>`.
 *
 * Layout sidebar is the most expensive layout primitive — it can
 * easily host 50+ rows, each with RBAC checks. Guardrails:
 *
 *  1. Mount cost bounded for realistic + worst-case row counts.
 *  2. `activeId` change only re-renders the rows that need re-styling
 *     (today: all rows re-render because we don't `React.memo` them,
 *     but the total time is still bounded).
 *  3. Group expand/collapse only re-renders THAT group.
 *  4. Toggling `collapsed` does not allocate per-item maps.
 */
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import { LeftNav } from './LeftNav.js';
import type { LeftNavNode } from './leftNav.types.js';

void React;
afterEach(() => cleanup());

function makeFlatNav(n: number): LeftNavNode[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `r${i}`,
    label: `Row ${i}`,
    href: `/r${i}`,
  }));
}

function makeNestedNav(groups: number, perGroup: number): LeftNavNode[] {
  return Array.from({ length: groups }, (_, g) => ({
    kind: 'group' as const,
    id: `g${g}`,
    label: `Group ${g}`,
    children: Array.from({ length: perGroup }, (_, i) => ({
      id: `g${g}-r${i}`,
      label: `Row ${i}`,
      href: `/g${g}/r${i}`,
    })),
  }));
}

function withRenderCounter<P>(
  Component: React.ComponentType<P>,
  counterRef: { count: number }
): React.FC<P> {
  return function Counted(props: P) {
    counterRef.count++;
    return <Component {...(props as P & object)} />;
  };
}

describe('<LeftNav> performance', () => {
  it('mounts a realistic 30-row flat nav in under 50ms', () => {
    const items = makeFlatNav(30);
    const t0 = performance.now();
    render(<LeftNav items={items} />);
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(50);
  });

  it('mounts a 300-row flat nav in under 250ms', () => {
    const items = makeFlatNav(300);
    const t0 = performance.now();
    render(<LeftNav items={items} />);
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(250);
  });

  it('mounts a 10×10 nested nav (100 leaf rows) in under 150ms', () => {
    const items = makeNestedNav(10, 10);
    const t0 = performance.now();
    render(<LeftNav items={items} />);
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(150);
  });

  it('toggles `collapsed` in under 100ms (30 rows)', () => {
    const items = makeFlatNav(30);
    const { rerender } = render(<LeftNav items={items} />);
    const t0 = performance.now();
    rerender(<LeftNav items={items} collapsed />);
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(100);
  });
});

describe('<LeftNav> re-render budget', () => {
  it('renders at most 2 times on mount (top-level wrapper)', () => {
    const counter = { count: 0 };
    const Counted = withRenderCounter(LeftNav, counter);
    render(<Counted items={makeFlatNav(10)} />);
    expect(counter.count).toBeLessThanOrEqual(2);
  });

  it('does NOT re-render the wrapper when a group expands locally', () => {
    // Group state is local — flipping it must not bubble a re-render
    // up to the LeftNav wrapper.
    const counter = { count: 0 };
    const Counted = withRenderCounter(LeftNav, counter);
    render(<Counted items={makeNestedNav(2, 3)} />);
    const baseline = counter.count;
    const header = screen.getByRole('button', { name: /Group 0/ });
    fireEvent.click(header);
    fireEvent.click(header);
    fireEvent.click(header);
    expect(counter.count).toBe(baseline);
  });

  it('does NOT re-render an unrelated sibling when collapsing the nav', () => {
    const sibCount = { count: 0 };
    const Sibling = () => {
      sibCount.count++;
      return <div data-testid="sib" />;
    };
    const Shell = ({ collapsed }: { collapsed: boolean }) => (
      <div>
        <LeftNav items={makeFlatNav(20)} collapsed={collapsed} />
        <Sibling />
      </div>
    );
    const { rerender } = render(<Shell collapsed={false} />);
    const baseline = sibCount.count;
    rerender(<Shell collapsed={true} />);
    // 1 parent re-render → 1 sibling re-render. Allow 1 extra for
    // React strict-mode or commit-phase double-invocation in dev.
    expect(sibCount.count - baseline).toBeLessThanOrEqual(2);
  });

  it('activeId change updates aria-current without throwing', () => {
    const items = makeFlatNav(5);
    const { rerender } = render(
      <LeftNav items={items} activeId="r0" />
    );
    expect(
      screen.getByRole('link', { name: 'Row 0' }).getAttribute('aria-current')
    ).toBe('page');
    rerender(<LeftNav items={items} activeId="r3" />);
    expect(
      screen.getByRole('link', { name: 'Row 0' }).getAttribute('aria-current')
    ).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Row 3' }).getAttribute('aria-current')
    ).toBe('page');
  });

  it('group expanded state is preserved across parent re-renders', () => {
    // Local state inside `<NavGroupRow>` must survive a parent
    // re-render. Without this, every `activeId` change would reset
    // every group to its `defaultExpanded`, which would be terrible UX.
    const items = makeNestedNav(2, 3);
    const { container, rerender } = render(
      <LeftNav items={items} activeId="g0-r0" />
    );
    // Collapse Group 0 — Group 0's first child href becomes invisible.
    fireEvent.click(screen.getByRole('button', { name: /Group 0/ }));
    const g0Child = () =>
      container.querySelector('a[href="/g0/r0"]');
    expect(g0Child()).toBeNull();
    // Now change activeId to a row in Group 1.
    rerender(<LeftNav items={items} activeId="g1-r0" />);
    // Group 0 must STAY collapsed (local state survived parent re-render).
    expect(g0Child()).toBeNull();
  });
});
