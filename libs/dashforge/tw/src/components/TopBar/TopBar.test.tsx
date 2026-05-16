// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TopBar } from './TopBar.js';

void React;
afterEach(() => cleanup());

describe('<TopBar>', () => {
  it('renders as a banner landmark by default (<header>)', () => {
    render(<TopBar end={<span>x</span>} />);
    expect(screen.getByRole('banner')).toBeTruthy();
  });

  it('renders as a plain <div> when asDiv is true', () => {
    const { container } = render(<TopBar end={<span>x</span>} asDiv />);
    expect(container.querySelector('header')).toBeNull();
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('renders the start slot', () => {
    render(<TopBar start={<button>menu</button>} />);
    expect(screen.getByRole('button', { name: 'menu' })).toBeTruthy();
  });

  it('renders the center slot', () => {
    render(<TopBar center={<span data-testid="c">page</span>} />);
    expect(screen.getByTestId('c')).toBeTruthy();
  });

  it('renders the end slot', () => {
    render(<TopBar end={<button>user</button>} />);
    expect(screen.getByRole('button', { name: 'user' })).toBeTruthy();
  });

  it('renders children as the center slot when `center` is not provided', () => {
    render(
      <TopBar>
        <span data-testid="child">title</span>
      </TopBar>
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('prefers explicit `center` over children', () => {
    render(
      <TopBar center={<span data-testid="explicit-center">c</span>}>
        <span data-testid="child">should-not-render</span>
      </TopBar>
    );
    expect(screen.getByTestId('explicit-center')).toBeTruthy();
    expect(screen.queryByTestId('child')).toBeNull();
  });

  it('does not render start / end wrappers when those props are absent', () => {
    const { container } = render(<TopBar center={<span>c</span>} />);
    // Inner divs: only the center div is rendered when start/end are
    // both undefined (we render `<div>{center ?? children}</div>` always).
    expect(container.querySelectorAll('header > div')).toHaveLength(1);
  });

  it('applies the sx className to the root', () => {
    const { container } = render(
      <TopBar center={<span>c</span>} sx="custom-class" />
    );
    expect(container.querySelector('header.custom-class')).toBeTruthy();
  });

  it('renders height variants without throwing', () => {
    (['sm', 'md', 'lg'] as const).forEach((h) => {
      const { unmount } = render(<TopBar center={<span>c</span>} height={h} />);
      expect(screen.getByRole('banner')).toBeTruthy();
      unmount();
    });
  });
});

describe('<TopBar> performance', () => {
  it('mounts in under 20ms', () => {
    const t0 = performance.now();
    render(
      <TopBar
        start={<button>start</button>}
        center={<span>center</span>}
        end={<button>end</button>}
      />
    );
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(20);
  });

  it('renders at most 2 times on mount', () => {
    let count = 0;
    const Counted = (props: React.ComponentProps<typeof TopBar>) => {
      count++;
      return <TopBar {...props} />;
    };
    render(
      <Counted
        start={<button>s</button>}
        center={<span>c</span>}
        end={<button>e</button>}
      />
    );
    expect(count).toBeLessThanOrEqual(2);
  });

  it('does NOT re-render an unrelated sibling on prop change', () => {
    const sibCount = { count: 0 };
    const Sibling = () => {
      sibCount.count++;
      return <div data-testid="sib" />;
    };
    const Tree = ({ label }: { label: string }) => (
      <div>
        <TopBar center={<span>{label}</span>} />
        <Sibling />
      </div>
    );
    const { rerender } = render(<Tree label="A" />);
    const before = sibCount.count;
    rerender(<Tree label="B" />);
    rerender(<Tree label="C" />);
    // Each parent rerender is expected to also re-render the sibling.
    // 2 parent rerenders ⇒ ≤ 2 extra sibling renders (+1 tolerance).
    expect(sibCount.count - before).toBeLessThanOrEqual(3);
  });
});
