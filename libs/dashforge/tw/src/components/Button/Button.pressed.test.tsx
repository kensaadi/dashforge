// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { Button } from './Button.js';
import { buttonVariants } from './button.variants.js';

void React;
afterEach(() => cleanup());

/**
 * kensaadi/dashforge#63 gap C — a toggle state on `<Button>`. The workaround
 * on record was "swap variant outline ↔ ghost and set aria-pressed by hand",
 * which is two decisions a consumer should not have to make and one they
 * routinely forget: the ARIA.
 *
 * The part worth guarding hardest is the opt-in. `aria-pressed` on a button
 * that is not a toggle is not a harmless extra: it makes a screen reader
 * announce "not pressed" on an ordinary action, so every plain button in
 * the catalog would start lying. The first block below is that.
 */

const cls = (ui: React.ReactElement) =>
  render(ui).container.firstElementChild!.className;

describe('<Button pressed>', () => {
  describe('the ARIA is opt-in', () => {
    it('emits no aria-pressed at all when the prop is absent', () => {
      render(<Button>Save</Button>);
      const btn = screen.getByRole('button');

      // Not "false": absent. A plain button must not be a toggle.
      expect(btn.hasAttribute('aria-pressed')).toBe(false);
    });

    it('emits aria-pressed="false" when explicitly off', () => {
      render(<Button pressed={false}>Bold</Button>);
      expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false');
    });

    it('emits aria-pressed="true" when on', () => {
      render(<Button pressed>Bold</Button>);
      expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
    });

    it('carries the ARIA through asChild too', () => {
      render(
        <Button asChild pressed>
          <a href="#x">Bold</a>
        </Button>
      );
      expect(screen.getByRole('link').getAttribute('aria-pressed')).toBe('true');
    });

    it('never leaks `pressed` onto the DOM as an attribute', () => {
      // React 19 passes unknown lowercase attributes through in silence,
      // which is how `tooltip` once shipped onto elements (BUG 9).
      render(<Button pressed>Bold</Button>);
      expect(screen.getByRole('button').hasAttribute('pressed')).toBe(false);
    });
  });

  describe('the quiet variants gain a surface', () => {
    it.each(['outline', 'ghost'] as const)(
      '%s + pressed reads as the catalog’s active shape',
      (variant) => {
        const c = cls(
          <Button variant={variant} color="primary" pressed>
            Bold
          </Button>
        );

        // LeftNav's `itemActive` is `bg-primary-100 text-primary-900
        // font-medium`. Pinned as a triple so nobody "simplifies" the
        // pressed look into something invented.
        expect(c).toContain('bg-primary-100');
        expect(c).toContain('text-primary-900');
        expect(c).toContain('font-medium');
      }
    );

    it('paints nothing when off', () => {
      const c = cls(
        <Button variant="ghost" color="primary" pressed={false}>
          Bold
        </Button>
      );
      expect(c).not.toContain('bg-primary-100');
    });

    it('keeps the inverse role on its own wash rather than a scale tint', () => {
      // `inverse` does not follow the theme, so a `-100` tint from a scale
      // that does would be wrong on the dark surface it exists for.
      const c = cls(
        <Button variant="ghost" color="inverse" pressed>
          Bold
        </Button>
      );

      expect(c).toContain('bg-inverse-50/20');
      expect(c).not.toContain('bg-inverse-100');
      // The ring offset stays transparent, or focus paints a white halo on
      // the dark surface this role exists for.
      expect(c).toContain('focus-visible:ring-offset-transparent');
    });
  });

  describe('solid deepens instead of tinting', () => {
    it.each([
      ['primary', 'bg-primary-700'],
      ['danger', 'bg-danger-700'],
    ] as const)('solid %s pressed uses %s', (color, expected) => {
      const c = cls(
        <Button variant="solid" color={color} pressed>
          On
        </Button>
      );

      expect(c).toContain(expected);
      // A `-100` tint over a filled button would wash it out.
      expect(c).not.toContain(`bg-${color}-100`);
    });
  });

  describe('link is deliberately unpainted', () => {
    it('gets the ARIA but no surface', () => {
      render(
        <Button variant="link" color="primary" pressed>
          Bold
        </Button>
      );
      const btn = screen.getByRole('button');

      expect(btn.getAttribute('aria-pressed')).toBe('true');
      expect(btn.className).not.toContain('bg-primary-100');
    });
  });

  describe('the axis covers the whole matrix', () => {
    it('every colour has a pressed treatment on both quiet variants', () => {
      // The failure this catches: a colour added later to `color` without a
      // matching pressed row, which reads as a toggle that never turns on.
      for (const color of [
        'primary',
        'secondary',
        'success',
        'warning',
        'danger',
        'inverse',
      ] as const) {
        for (const variant of ['outline', 'ghost'] as const) {
          const on = buttonVariants({ variant, color, pressed: true });
          const off = buttonVariants({ variant, color, pressed: false });
          expect(on, `${variant}/${color}`).not.toBe(off);
          expect(on, `${variant}/${color}`).toContain('font-medium');
        }
      }
    });
  });
});
