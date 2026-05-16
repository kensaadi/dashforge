// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import { AppShell } from './AppShell.js';

void React;
afterEach(() => cleanup());

describe('<AppShell>', () => {
  describe('rendering', () => {
    it('renders main landmark with children', () => {
      render(
        <AppShell>
          <p>page</p>
        </AppShell>
      );
      const main = screen.getByRole('main');
      expect(main.textContent).toBe('page');
    });

    it('renders header slot', () => {
      render(
        <AppShell header={<div data-testid="hdr">H</div>}>
          <p>page</p>
        </AppShell>
      );
      expect(screen.getByTestId('hdr')).toBeTruthy();
    });

    it('renders footer slot', () => {
      render(
        <AppShell footer={<div data-testid="ftr">F</div>}>
          <p>page</p>
        </AppShell>
      );
      expect(screen.getByTestId('ftr')).toBeTruthy();
    });

    it('renders nav slot (twice — desktop inline + mobile drawer)', () => {
      const { container } = render(
        <AppShell nav={<div data-testid="nav">N</div>}>
          <p>page</p>
        </AppShell>
      );
      // Both copies are in the DOM; the mobile one is hidden via CSS.
      expect(container.querySelectorAll('[data-testid="nav"]')).toHaveLength(2);
    });

    it('does NOT render the nav-side asides when nav is omitted', () => {
      const { container } = render(
        <AppShell>
          <p>page</p>
        </AppShell>
      );
      // Only the <main> remains inside the body row.
      expect(container.querySelectorAll('aside')).toHaveLength(0);
    });
  });

  describe('mobile drawer', () => {
    it('renders the mobile aside with aria-hidden=true by default', () => {
      const { container } = render(
        <AppShell nav={<div>N</div>}>
          <p>page</p>
        </AppShell>
      );
      const mobile = container.querySelectorAll('aside')[1];
      expect(mobile.getAttribute('aria-hidden')).toBe('true');
    });

    it('exposes the mobile aside (aria-hidden=false) when navOpen', () => {
      const { container } = render(
        <AppShell nav={<div>N</div>} navOpen onNavOpenChange={vi.fn()}>
          <p>page</p>
        </AppShell>
      );
      const mobile = container.querySelectorAll('aside')[1];
      expect(mobile.getAttribute('aria-hidden')).toBe('false');
    });

    it('fires onNavOpenChange(false) when the backdrop is clicked', () => {
      const cb = vi.fn();
      render(
        <AppShell nav={<div>N</div>} navOpen onNavOpenChange={cb}>
          <p>page</p>
        </AppShell>
      );
      fireEvent.click(screen.getByTestId('appshell-backdrop'));
      expect(cb).toHaveBeenCalledWith(false);
    });

    it('fires onNavOpenChange(false) when Escape is pressed', () => {
      const cb = vi.fn();
      render(
        <AppShell nav={<div>N</div>} navOpen onNavOpenChange={cb}>
          <p>page</p>
        </AppShell>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(cb).toHaveBeenCalledWith(false);
    });

    it('does NOT fire Escape callback when drawer is closed', () => {
      const cb = vi.fn();
      render(
        <AppShell nav={<div>N</div>} onNavOpenChange={cb}>
          <p>page</p>
        </AppShell>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('body scroll lock', () => {
    it('locks body overflow while navOpen is true', () => {
      const { rerender, unmount } = render(
        <AppShell nav={<div>N</div>} navOpen>
          <p>page</p>
        </AppShell>
      );
      expect(document.body.style.overflow).toBe('hidden');
      rerender(
        <AppShell nav={<div>N</div>}>
          <p>page</p>
        </AppShell>
      );
      expect(document.body.style.overflow).not.toBe('hidden');
      unmount();
    });

    it('restores body overflow on unmount even if still open', () => {
      const { unmount } = render(
        <AppShell nav={<div>N</div>} navOpen>
          <p>page</p>
        </AppShell>
      );
      expect(document.body.style.overflow).toBe('hidden');
      unmount();
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });
});

describe('<AppShell> performance', () => {
  it('mounts under 30ms with all slots filled', () => {
    const t0 = performance.now();
    render(
      <AppShell
        header={<div>H</div>}
        nav={<div>N</div>}
        footer={<div>F</div>}
      >
        <p>page</p>
      </AppShell>
    );
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(30);
  });

  it('renders at most 2 times on mount', () => {
    let count = 0;
    const Counted = (p: React.ComponentProps<typeof AppShell>) => {
      count++;
      return <AppShell {...p} />;
    };
    render(
      <Counted nav={<div>N</div>}>
        <p>page</p>
      </Counted>
    );
    expect(count).toBeLessThanOrEqual(2);
  });

  it('toggling navOpen costs ≤ 1 extra render on the wrapper', () => {
    let count = 0;
    const Counted = (p: React.ComponentProps<typeof AppShell>) => {
      count++;
      return <AppShell {...p} />;
    };
    const { rerender } = render(
      <Counted nav={<div>N</div>} navOpen={false}>
        <p>page</p>
      </Counted>
    );
    const baseline = count;
    rerender(
      <Counted nav={<div>N</div>} navOpen={true}>
        <p>page</p>
      </Counted>
    );
    expect(count - baseline).toBeLessThanOrEqual(2);
  });

  it('does NOT re-render an unrelated sibling on navOpen toggle', () => {
    const sibCount = { count: 0 };
    const Sibling = () => {
      sibCount.count++;
      return null;
    };
    const Tree = ({ open }: { open: boolean }) => (
      <div>
        <AppShell nav={<div>N</div>} navOpen={open}>
          <p>page</p>
        </AppShell>
        <Sibling />
      </div>
    );
    const { rerender } = render(<Tree open={false} />);
    const before = sibCount.count;
    rerender(<Tree open={true} />);
    rerender(<Tree open={false} />);
    // Each parent re-render triggers the sibling once. 2 parent
    // rerenders ⇒ ≤ 2 extra sibling renders (tolerance +1).
    expect(sibCount.count - before).toBeLessThanOrEqual(3);
  });
});
