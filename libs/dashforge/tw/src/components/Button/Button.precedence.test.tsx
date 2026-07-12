// @vitest-environment jsdom
/**
 * Option C precedence chain — Button.
 *
 * Locks the 4-level override order:
 *   1. `defaultVariants` from tailwind-variants (buttonVariants recipe)
 *   2. Theme override via `patchTheme({ components: { Button: { defaults } } })`
 *   3. Instance prop (`<Button color="danger" />`)
 *   4. `sx` — final utility-class layer via tailwind-merge
 *
 * The assertion strategy is to check the class list of the rendered
 * `<button>`. Each level adds / replaces a specific token; we assert
 * the presence (or absence) of the corresponding Tailwind class.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Button } from './Button.js';

function classesOf(node: HTMLElement): Set<string> {
  return new Set(node.className.split(/\s+/).filter(Boolean));
}

beforeEach(() => {
  // Reset the theme store to the shipped default between tests so
  // one test's `patchTheme` doesn't leak into the next.
  //
  // `setTheme` under the hood is `Object.assign(store, theme)` — a
  // shallow merge — so a bare `setTheme(defaultTWThemeLight)` would
  // leave residual `components` from a previous test's `patchTheme`
  // in place. Explicitly clearing `components: undefined` on the
  // reset object closes that hole.
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Button precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaultVariants alone: color=primary, variant=solid, size=md, radius=md', () => {
    const { getByRole } = render(<Button>Save</Button>);
    const cls = classesOf(getByRole('button'));

    // TV `defaultVariants`: variant=solid + color=primary → primary-500 bg
    expect(cls.has('bg-primary-500')).toBe(true);
    // TV `defaultVariants`: size=md → h-10 px-4 text-base
    expect(cls.has('h-10')).toBe(true);
    expect(cls.has('px-4')).toBe(true);
    // Base: rounded-md (hardcoded in `base` at Track A step 1 — will
    // become a variant axis in a future refactor).
    expect(cls.has('rounded-md')).toBe(true);
  });

  it('level 2 — theme override wins over defaultVariants', () => {
    act(() => {
      // Consumer sets a global Button default: solid → outline, primary → danger.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Button: {
            defaults: { variant: 'outline', color: 'danger' },
          },
        },
      });
    });

    const { getByRole } = render(<Button>Save</Button>);
    const cls = classesOf(getByRole('button'));

    // Theme-configured `variant=outline` + `color=danger` produces
    // outline-danger compound: border-danger-500 text-danger-700.
    expect(cls.has('border-danger-500')).toBe(true);
    expect(cls.has('text-danger-700')).toBe(true);

    // Regression: the TV defaultVariant primary+solid combo MUST NOT
    // paint here — that would mean theme override didn't apply.
    expect(cls.has('bg-primary-500')).toBe(false);
  });

  it('level 3 — instance prop wins over theme override', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Button: {
            defaults: { variant: 'outline', color: 'danger' },
          },
        },
      });
    });

    // Instance passes `variant="solid"` and `color="success"` — MUST
    // override the theme's outline+danger.
    const { getByRole } = render(
      <Button variant="solid" color="success">
        Publish
      </Button>,
    );
    const cls = classesOf(getByRole('button'));

    // Instance solid+success compound: bg-success-500.
    expect(cls.has('bg-success-500')).toBe(true);

    // Neither theme nor default should have any color leak here.
    expect(cls.has('border-danger-500')).toBe(false);
    expect(cls.has('bg-primary-500')).toBe(false);
  });

  it('level 4 — sx wins over instance variant classes via tailwind-merge', () => {
    // Instance is bg-primary-500 (TV default), but sx forces bg-red-500.
    // tailwind-merge inside `cn()` collapses the two `bg-*` classes and
    // keeps the last one — that's the `sx` value.
    const { getByRole } = render(<Button sx="bg-red-500">Boom</Button>);
    const cls = classesOf(getByRole('button'));

    expect(cls.has('bg-red-500')).toBe(true);
    expect(cls.has('bg-primary-500')).toBe(false);
  });

  it('theme partial override — unset fields fall through to TV defaultVariants', () => {
    // Theme only sets `size`; variant + color + fullWidth + loading
    // must still come from TV defaults.
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Button: {
            defaults: { size: 'lg' },
          },
        },
      });
    });

    const { getByRole } = render(<Button>Grow</Button>);
    const cls = classesOf(getByRole('button'));

    // Theme's size=lg → h-12 px-6 text-lg.
    expect(cls.has('h-12')).toBe(true);
    expect(cls.has('px-6')).toBe(true);
    // Variant + color still come from TV defaults: solid + primary.
    expect(cls.has('bg-primary-500')).toBe(true);
  });

  it('reactive: patchTheme after mount re-renders with the new theme defaults', () => {
    const { getByRole, rerender } = render(<Button>Save</Button>);
    const before = classesOf(getByRole('button'));
    expect(before.has('bg-primary-500')).toBe(true);

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Button: {
            defaults: { color: 'success' },
          },
        },
      });
    });
    rerender(<Button>Save</Button>);

    const after = classesOf(getByRole('button'));
    expect(after.has('bg-success-500')).toBe(true);
    expect(after.has('bg-primary-500')).toBe(false);
  });

  it('does not accept non-variant props from theme defaults (compile-time contract, runtime tolerance)', () => {
    // The declaration merging block in button.types.ts restricts
    // theme.components.Button.defaults to Partial<ButtonVariantProps>.
    // At runtime we just merge — any extra property leaks to `rest`
    // and would spread onto the <button> DOM element. This test locks
    // the current behavior: theme with only variant axes never
    // pollutes the DOM with non-standard attributes.
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Button: {
            defaults: { color: 'warning' },
          },
        },
      });
    });

    const { getByRole } = render(<Button data-testid="normal">Warn</Button>);
    const btn = getByRole('button');
    // No leaked variant prop as a DOM attribute.
    expect(btn.hasAttribute('color')).toBe(false);
    expect(btn.hasAttribute('variant')).toBe(false);
    // The intended data-testid still gets through.
    expect(btn.getAttribute('data-testid')).toBe('normal');
  });
});

// Silence the vitest warn about non-registered vi.mock etc. (no mocks used here).
vi.hoisted(() => undefined);
