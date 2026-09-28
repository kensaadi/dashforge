// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { buttonVariants } from './button.variants';
import { dashforgePreset } from '@dashforge/tw-theme';
import { defaultTWThemeLight, defaultTWThemeDark } from '@dashforge/tw-tokens';

/**
 * Guard for kensaadi/dashforge#140 — `color="inverse"`.
 *
 * Originally filed as BUG 24: `<Button variant="ghost|outline|link">` could
 * not be placed on a surface that is dark independently of the theme, so
 * every dark hero and ink footer hand-rolled its own button.
 *
 * The fix is a theme-INVARIANT token role. The trap it has to avoid is
 * building on `neutral`, which inverts so `bg-neutral-50` always means
 * "page surface" — correct in light, unreadable in dark. These tests pin
 * the invariance at the token level and the wiring at the recipe level.
 */

const classesFor = (variant: 'solid' | 'outline' | 'ghost' | 'link') =>
  buttonVariants({ variant, color: 'inverse' }).split(/\s+/).filter(Boolean);

describe('#140 — Button color="inverse"', () => {
  it('is theme-invariant at the token level', () => {
    // The whole point. If this ever starts flipping, the button is
    // unreadable in exactly one of the two themes and nothing else catches
    // it, because both themes look fine in isolation.
    const light = defaultTWThemeLight.color.inverse;
    const dark = defaultTWThemeDark.color.inverse;
    expect(dark).toEqual(light);

    // And it is NOT neutral wearing a different name: neutral does flip.
    expect(defaultTWThemeDark.color.neutral).not.toEqual(
      defaultTWThemeLight.color.neutral,
    );
  });

  it('reaches the Tailwind colour map, not just the CSS vars', () => {
    // `twThemeCssVars` iterates the token tree, but `buildColorRefs` used
    // to list the roles by hand. A role could therefore emit CSS variables
    // while generating no utility class at all.
    const colors = dashforgePreset().theme.extend.colors;
    expect(colors).toHaveProperty('inverse');
    expect(colors.inverse['50']).toContain('--df-tw-color-inverse-50');
  });

  it.each(['solid', 'outline', 'ghost'] as const)(
    '%s neutralises the ring offset, or focus paints a white halo',
    (variant) => {
      // The base sets `focus-visible:ring-offset-2` and nothing declares an
      // offset colour, so it falls through to Tailwind v4's `#fff`.
      expect(classesFor(variant)).toContain(
        'focus-visible:ring-offset-transparent',
      );
    },
  );

  it('the transparent variants take their foreground from the inverse ramp', () => {
    for (const variant of ['outline', 'ghost', 'link'] as const) {
      const cls = classesFor(variant);
      expect(cls).toContain('text-inverse-50');
      // Must not fall back to a semantic tone, which is what made the
      // original report: a dark label on a dark ground.
      expect(cls.some((c) => /^text-(primary|secondary|neutral)-\d/.test(c))).toBe(
        false,
      );
    }
  });

  it('solid inverts the pair rather than going transparent', () => {
    // A light button with dark text: the canonical CTA on a dark hero.
    // Included so `color="inverse"` does not behave differently per
    // variant on a discoverable enum.
    const cls = classesFor('solid');
    expect(cls).toContain('bg-inverse-50');
    expect(cls).toContain('text-inverse-900');
    // The `solid` variant's own `text-white` must lose to the compound.
    expect(cls).not.toContain('text-white');
  });

  it('leaves the other colours untouched', () => {
    const ghostPrimary = buttonVariants({ variant: 'ghost', color: 'primary' });
    expect(ghostPrimary).toContain('text-primary-700');
    expect(ghostPrimary).not.toContain('inverse');
  });
});
