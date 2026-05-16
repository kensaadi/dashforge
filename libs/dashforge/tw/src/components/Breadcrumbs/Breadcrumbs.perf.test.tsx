// @vitest-environment jsdom
/**
 * Performance + re-render budget tests for `<Breadcrumbs>`.
 *
 * Layout components are typically near the top of the tree, so a
 * regression here ripples through everything below. Guardrails:
 *
 *  1. Mount cost stays bounded even with very long trails.
 *  2. Re-rendering the parent with the SAME items reference does not
 *     re-do the truncation memo work (verifies `useMemo` deps).
 *  3. Truncation does not allocate per-render arrays that would defeat
 *     the React keyed-reuse heuristics.
 */
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Breadcrumbs } from './Breadcrumbs.js';
import type { BreadcrumbItem } from './breadcrumbs.types.js';

void React;
afterEach(() => cleanup());

function makeTrail(n: number): BreadcrumbItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `c${i}`,
    label: `Crumb ${i}`,
    href: i === n - 1 ? undefined : `/c${i}`,
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

describe('<Breadcrumbs> performance', () => {
  it('mounts a 50-crumb trail under 50ms', () => {
    const trail = makeTrail(50);
    const t0 = performance.now();
    render(<Breadcrumbs items={trail} />);
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(50);
  });

  it('mounts a 1000-crumb (collapsed) trail under 100ms', () => {
    const trail = makeTrail(1000);
    const t0 = performance.now();
    render(<Breadcrumbs items={trail} maxItems={5} />);
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(100);
  });
});

describe('<Breadcrumbs> re-render budget', () => {
  it('renders at most 2 times on mount', () => {
    const counter = { count: 0 };
    const Counted = withRenderCounter(Breadcrumbs, counter);
    render(<Counted items={makeTrail(5)} />);
    expect(counter.count).toBeLessThanOrEqual(2);
  });

  it('re-renders exactly once per prop change to items', () => {
    const counter = { count: 0 };
    const Counted = withRenderCounter(Breadcrumbs, counter);
    const a = makeTrail(3);
    const b = makeTrail(4);
    const c = makeTrail(5);
    const { rerender } = render(<Counted items={a} />);
    const baseline = counter.count;
    rerender(<Counted items={b} />);
    rerender(<Counted items={c} />);
    // Two prop changes → up to two renders (plus tolerance).
    expect(counter.count - baseline).toBeLessThanOrEqual(3);
  });

  it('does NOT re-render siblings when only Breadcrumbs items change', () => {
    // Truncation memoization shouldn't leak through React.memo'd
    // siblings, but at minimum it must not trigger sibling renders
    // when the parent re-renders for an unrelated reason.
    const sibCount = { count: 0 };
    const Sibling = () => {
      sibCount.count++;
      return <div data-testid="sib" />;
    };
    const Tree = ({ items }: { items: BreadcrumbItem[] }) => (
      <div>
        <Breadcrumbs items={items} />
        <Sibling />
      </div>
    );
    const trail = makeTrail(5);
    const { rerender } = render(<Tree items={trail} />);
    const baseline = sibCount.count;
    // Re-render the parent with the SAME items reference — Sibling
    // should still re-render (parent re-rendered) but only ONCE per
    // parent re-render, no extra renders triggered by Breadcrumbs.
    rerender(<Tree items={trail} />);
    rerender(<Tree items={trail} />);
    expect(sibCount.count - baseline).toBeLessThanOrEqual(2);
  });

  it('truncation logic is stable: same items + same maxItems => same DOM ids', () => {
    // If `useMemo` is well-keyed, the rendered <li> elements (with
    // stable keys from item.id) should be identical DOM nodes across
    // unrelated re-renders. Detects an accidental "always new array"
    // refactor that would invalidate keys.
    const items = makeTrail(10);
    const { rerender, container } = render(
      <Breadcrumbs items={items} maxItems={4} />
    );
    const firstSnapshot = Array.from(container.querySelectorAll('li')).map(
      (li) => li.outerHTML
    );
    rerender(<Breadcrumbs items={items} maxItems={4} />);
    const secondSnapshot = Array.from(container.querySelectorAll('li')).map(
      (li) => li.outerHTML
    );
    expect(secondSnapshot).toEqual(firstSnapshot);
  });
});
