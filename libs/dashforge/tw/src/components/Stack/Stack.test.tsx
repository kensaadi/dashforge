// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Stack } from './Stack.js';

describe('<Stack>', () => {
  // ─── Default rendering ──────────────────────────────────────────────
  describe('default rendering', () => {
    it('renders a <div> by default', () => {
      const { container } = render(<Stack>x</Stack>);
      expect(container.firstElementChild?.tagName).toBe('DIV');
    });

    it('has flex + flex-col by default', () => {
      const { container } = render(<Stack>x</Stack>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('flex');
      expect(cls).toContain('flex-col');
    });
  });

  // ─── Direction ──────────────────────────────────────────────────────
  describe('direction', () => {
    it('row', () => {
      const { container } = render(<Stack direction="row">x</Stack>);
      expect(container.firstElementChild?.className).toContain('flex-row');
    });

    it('row-reverse', () => {
      const { container } = render(<Stack direction="row-reverse">x</Stack>);
      expect(container.firstElementChild?.className).toContain('flex-row-reverse');
    });
  });

  // ─── Align + justify ────────────────────────────────────────────────
  describe('align + justify', () => {
    it('align="center" + justify="between"', () => {
      const { container } = render(
        <Stack align="center" justify="between">x</Stack>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('items-center');
      expect(cls).toContain('justify-between');
    });

    it('align="baseline"', () => {
      const { container } = render(<Stack align="baseline">x</Stack>);
      expect(container.firstElementChild?.className).toContain('items-baseline');
    });
  });

  // ─── Gap + wrap + sizing ────────────────────────────────────────────
  describe('gap + wrap + sizing', () => {
    it('gap={4} emits gap-4', () => {
      const { container } = render(<Stack gap={4}>x</Stack>);
      expect(container.firstElementChild?.className).toContain('gap-4');
    });

    it('gap={"0.5"} emits gap-0.5', () => {
      const { container } = render(<Stack gap="0.5">x</Stack>);
      expect(container.firstElementChild?.className).toContain('gap-0.5');
    });

    it('wrap emits flex-wrap', () => {
      const { container } = render(<Stack wrap>x</Stack>);
      expect(container.firstElementChild?.className).toContain('flex-wrap');
    });

    it('fullWidth + fullHeight', () => {
      const { container } = render(<Stack fullWidth fullHeight>x</Stack>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('w-full');
      expect(cls).toContain('h-full');
    });
  });

  // ─── Divider ─────────────────────────────────────────────────────────
  describe('divider', () => {
    it('inserts N-1 dividers between N children', () => {
      const { container } = render(
        <Stack divider={<hr data-testid="div" />}>
          <span>a</span>
          <span>b</span>
          <span>c</span>
        </Stack>,
      );
      // 3 children + 2 dividers
      expect(container.firstElementChild?.children.length).toBe(5);
      const dividers = container.querySelectorAll('[data-testid="div"]');
      expect(dividers.length).toBe(2);
    });

    it('does NOT insert dividers when there is only one child', () => {
      const { container } = render(
        <Stack divider={<hr data-testid="div" />}>
          <span>only</span>
        </Stack>,
      );
      expect(container.firstElementChild?.children.length).toBe(1);
      expect(container.querySelectorAll('[data-testid="div"]').length).toBe(0);
    });

    it('treats a Fragment as a single child for divider boundary counting', () => {
      const { container } = render(
        <Stack divider={<hr data-testid="div" />}>
          <>
            <span>a</span>
            <span>b</span>
          </>
          <span>c</span>
        </Stack>,
      );
      // React.Children.toArray does NOT recursively flatten fragments — it
      // treats them as opaque single children. Documented behaviour: 2
      // top-level children → 1 divider between them. If you need a divider
      // BETWEEN the items inside the fragment, hoist them out of it.
      expect(container.querySelectorAll('[data-testid="div"]').length).toBe(1);
    });

    it('renders string/number divider correctly', () => {
      const { container } = render(
        <Stack divider=" · ">
          <span>a</span>
          <span>b</span>
          <span>c</span>
        </Stack>,
      );
      expect(container.firstElementChild?.textContent).toBe('a · b · c');
    });

    it('asChild silently ignores divider', () => {
      const { container } = render(
        <Stack asChild divider={<hr data-testid="div" />}>
          <nav>
            <a href="#">link</a>
          </nav>
        </Stack>,
      );
      // Slot wraps a single child — divider has nowhere to go
      expect(container.firstElementChild?.tagName).toBe('NAV');
      expect(container.querySelectorAll('[data-testid="div"]').length).toBe(0);
    });
  });

  // ─── Override + sx ──────────────────────────────────────────────────
  describe('override', () => {
    it('sx wins over variant defaults', () => {
      const { container } = render(
        <Stack direction="row" sx="flex-col">x</Stack>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('flex-col');
      expect(cls).not.toContain('flex-row');
    });

    it('sx can add utilities Stack does not expose (overflow)', () => {
      const { container } = render(<Stack sx="overflow-x-auto">x</Stack>);
      expect(container.firstElementChild?.className).toContain('overflow-x-auto');
    });
  });

  // ─── Polymorphism ───────────────────────────────────────────────────
  describe('polymorphism', () => {
    it('as="nav" renders a <nav>', () => {
      const { container } = render(<Stack as="nav">x</Stack>);
      expect(container.firstElementChild?.tagName).toBe('NAV');
    });

    it('asChild wins over as', () => {
      const { container } = render(
        <Stack as="nav" asChild>
          <header>x</header>
        </Stack>,
      );
      expect(container.firstElementChild?.tagName).toBe('HEADER');
    });
  });

  // ─── Pass-through ────────────────────────────────────────────────────
  it('forwards data-* + aria-*', () => {
    const { container } = render(
      <Stack data-testid="s" aria-label="settings">x</Stack>,
    );
    const el = container.firstElementChild;
    expect(el?.getAttribute('data-testid')).toBe('s');
    expect(el?.getAttribute('aria-label')).toBe('settings');
  });

  // ─── F11-bis edge cases: divider with array / null / mixed children ─
  describe('divider edge cases', () => {
    it('children passed as an array still gets N-1 dividers', () => {
      // Children.toArray handles arrays the same as iterated siblings —
      // the divider count is items.length - 1 regardless of how the
      // children were passed in.
      const items = ['a', 'b', 'c', 'd'];
      const { container } = render(
        <Stack divider={<hr data-testid="div" />}>
          {items.map((t) => <span key={t}>{t}</span>)}
        </Stack>,
      );
      expect(container.querySelectorAll('[data-testid="div"]').length).toBe(3);
    });

    it('null children are stripped before divider insertion', () => {
      // React's Children.toArray filters out null/undefined/false before
      // returning the flat array — so a conditional child collapses to
      // nothing and dividers are sized to the remaining set.
      const showB = false;
      const { container } = render(
        <Stack divider={<hr data-testid="div" />}>
          <span>a</span>
          {showB && <span>b</span>}
          <span>c</span>
        </Stack>,
      );
      // After stripping `false`: 2 effective children → 1 divider
      expect(container.querySelectorAll('[data-testid="div"]').length).toBe(1);
    });

    it('mixed text + element children — divider between EVERY pair', () => {
      const { container } = render(
        <Stack divider={<hr data-testid="div" />}>
          {'plain string'}
          <span>element child</span>
          {42}
          <span>last</span>
        </Stack>,
      );
      // 4 effective children (Children.toArray wraps primitives) → 3 dividers
      expect(container.querySelectorAll('[data-testid="div"]').length).toBe(3);
    });

    it('nested Stack inside Stack with divider — inner Stack counts as 1 child', () => {
      const { container } = render(
        <Stack gap={2} divider={<hr data-testid="outer-div" />}>
          <span>top</span>
          <Stack gap={1} direction="row">
            <span>nested-a</span>
            <span>nested-b</span>
          </Stack>
          <span>bottom</span>
        </Stack>,
      );
      // Outer has 3 effective children → 2 outer dividers
      expect(container.querySelectorAll('[data-testid="outer-div"]').length).toBe(2);
    });

    it('divider key is stable across re-renders (no key warning)', () => {
      // Re-rendering with the same children + divider shouldn't produce
      // React key warnings. We assert nothing throws + the structure is
      // identical to a single render.
      const { container, rerender } = render(
        <Stack divider={<hr data-testid="d" />}>
          <span>a</span>
          <span>b</span>
        </Stack>,
      );
      const firstRender = container.innerHTML;
      rerender(
        <Stack divider={<hr data-testid="d" />}>
          <span>a</span>
          <span>b</span>
        </Stack>,
      );
      expect(container.innerHTML).toBe(firstRender);
    });
  });

  // ─── F11-bis edge cases: gap value coverage ─────────────────────────
  describe('gap — every token step', () => {
    const GAPS = [0, '0.5', 1, 2, 3, 4, 6, 8, 12, 16, 24] as const;
    it.each(GAPS)('gap=%s emits gap-%s', (g) => {
      const { container } = render(<Stack gap={g}>x</Stack>);
      expect(container.firstElementChild?.className).toContain(`gap-${g}`);
    });
  });

  // ─── F11-bis edge cases: align / justify all values ─────────────────
  describe('align + justify — all valid values', () => {
    const ALIGNS = ['start', 'center', 'end', 'stretch', 'baseline'] as const;
    const JUSTIFIES = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;

    it.each(ALIGNS)('align="%s"', (v) => {
      const { container } = render(<Stack align={v}>x</Stack>);
      expect(container.firstElementChild?.className).toContain(`items-${v}`);
    });

    it.each(JUSTIFIES)('justify="%s"', (v) => {
      const { container } = render(<Stack justify={v}>x</Stack>);
      expect(container.firstElementChild?.className).toContain(`justify-${v}`);
    });
  });

  // ─── F11-bis edge cases: empty Stack ────────────────────────────────
  describe('empty Stack', () => {
    it('renders an empty div with flex classes', () => {
      const { container } = render(<Stack gap={4} />);
      const el = container.firstElementChild;
      expect(el?.children.length).toBe(0);
      expect(el?.className).toContain('flex');
      expect(el?.className).toContain('gap-4');
    });

    it('empty Stack with divider does NOT render the divider', () => {
      const { container } = render(<Stack divider={<hr data-testid="d" />} />);
      expect(container.querySelectorAll('[data-testid="d"]').length).toBe(0);
    });
  });

  // ─── #111 (G-27) — gap type widening + runtime dev-warn ─────────────
  // The `<Stack gap>` prop is TS-narrowed to the 11-value literal union
  // `0 | 0.5 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16 | 24`. A dynamic value
  // that slips past the type check (e.g. `gap={someProps.spacing}`
  // where the spacing prop is loosely typed) triggers a dev-only
  // console.warn per unknown value.
  describe('#111 (G-27) gap runtime dev-warn', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warnSpy.mockRestore();
      vi.unstubAllEnvs();
    });

    it('warns when gap is a token string like "md"', () => {
      render(
        <Stack direction="col" gap={'md' as never}>
          x
        </Stack>,
      );
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain('<Stack gap={"md"}>');
      expect(warnSpy.mock.calls[0][0]).toContain('token-scale set');
    });

    it('warns when gap is an off-scale numeric like 5', () => {
      render(
        <Stack direction="col" gap={5 as never}>
          x
        </Stack>,
      );
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain('<Stack gap={5}>');
    });

    it('does NOT warn when gap is on the accepted scale', () => {
      render(
        <>
          <Stack direction="col" gap={0}>x</Stack>
          <Stack direction="col" gap={0.5}>x</Stack>
          <Stack direction="col" gap={3}>x</Stack>
          <Stack direction="col" gap={24}>x</Stack>
        </>,
      );
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('does NOT warn when gap is omitted', () => {
      render(<Stack direction="col">x</Stack>);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('warns at most once per unknown value across the module lifetime', () => {
      // Two Stacks with the SAME unknown gap — one warning total.
      render(
        <>
          <Stack gap={'unique-sentinel-1' as never}>x</Stack>
          <Stack gap={'unique-sentinel-1' as never}>y</Stack>
        </>,
      );
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('is a no-op in production builds', () => {
      vi.stubEnv('NODE_ENV', 'production');
      render(
        <Stack gap={'unique-sentinel-prod' as never}>x</Stack>,
      );
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  // ─── #112 (G-28) — className sneak-in via untyped spread ─────────────
  // The `StackProps` interface Omit-excludes `className`, but TS-loose
  // consumers can still smuggle one in at runtime via untyped
  // `{...anyProps}` spreads. The runtime safety-net must:
  //   (a) preserve variant classes (`flex flex-col gap-*`)
  //   (b) merge the consumer's utility class alongside them
  //   (c) NOT emit `className=""` or a stale value as a raw DOM attribute
  describe('#112 (G-28) className sneak-in safety net', () => {
    it('preserves variant classes when a non-conflicting className is smuggled in', () => {
      const smuggled = { className: 'min-h-0' } as Record<string, unknown>;
      const { container } = render(
        <Stack direction="col" gap={3} {...(smuggled as never)}>
          x
        </Stack>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('flex');
      expect(cls).toContain('flex-col');
      expect(cls).toContain('gap-3');
      expect(cls).toContain('min-h-0');
    });

    it('lets tailwind-merge resolve when the smuggled class conflicts with a variant', () => {
      // Consumer smuggles `gap-6` — this WOULD collide with `gap-3` from the
      // variant. Later argument to `cn()` wins under tailwind-merge, so
      // `gap-6` (consumer) survives and `gap-3` (variant) is dropped. `sx`
      // then wins over both if provided; not exercised here — see the
      // precedence test file for that.
      const smuggled = { className: 'gap-6' } as Record<string, unknown>;
      const { container } = render(
        <Stack direction="col" gap={3} {...(smuggled as never)}>
          x
        </Stack>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('gap-6');
      expect(cls).not.toContain('gap-3');
    });

    it('does not double-emit className as a DOM attribute', () => {
      // Regression for the JSX prop-override root cause: the smuggled
      // className must be consumed by the destructure, not survive into
      // `...safeRest` and clobber the final `className={classes}`.
      const smuggled = { className: 'min-h-0' } as Record<string, unknown>;
      const { container } = render(
        <Stack direction="col" gap={3} {...(smuggled as never)}>
          x
        </Stack>,
      );
      // The variant classes must survive alongside the smuggled utility —
      // if the DOM `className` were the raw `"min-h-0"` from JSX override,
      // `flex flex-col gap-3` would be gone entirely.
      const el = container.firstElementChild as HTMLElement;
      expect(el.classList.contains('flex')).toBe(true);
      expect(el.classList.contains('flex-col')).toBe(true);
      expect(el.classList.contains('gap-3')).toBe(true);
      expect(el.classList.contains('min-h-0')).toBe(true);
    });
  });
});
