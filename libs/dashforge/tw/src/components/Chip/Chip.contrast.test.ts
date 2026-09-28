// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { chipVariants } from './chip.variants';

/**
 * Regression guard for BUG 40 in libs/dashforge/README-BUG.md.
 *
 * An `outline` chip IS its border: remove the border from the reading and
 * nothing is left but text on the page surface. That makes the border a
 * UI component boundary, so WCAG 1.4.11 applies and the threshold is 3:1.
 *
 * Measured against `dashforgePreset()`'s neutral scale, on the real
 * surfaces (`#fafafa` light, `#0a0a0a` dark):
 *
 *   tier            light    dark
 *   neutral-300     1.42     1.91     <- what shipped; fails both
 *   neutral-400     2.42     2.53     <- still fails both
 *   neutral-500     4.54     4.18     <- passes both
 *   neutral-600     7.49     7.85     <- passes, too heavy for a chip
 *
 * Two things the report got backwards, kept here because the next reader
 * will start from the same place:
 *
 *   - It blamed the TEXT. The text is fine: `text-neutral-700` measures
 *     9.93:1 light and 13.36:1 dark, comfortably past 4.5:1. `neutral`
 *     auto-inverts through the preset's CSS vars, which is exactly why it
 *     is the one colour row with no `dark:` variant, and adding one would
 *     invert twice.
 *   - It blamed DARK MODE. Dark is the better of the two: 1.91 against
 *     light's 1.42. The border failed in both themes, and worse in light.
 *
 * `neutral-500` is also where the other six colour rows already sit
 * (`border-primary-500`, `border-success-500`, …). `neutral` alone was at
 * 300, so this is a defect and an inconsistency closed by one edit.
 *
 * jsdom resolves no palette, so the tier is what gets asserted here. The
 * contrast numbers are computed in the entry from the token scale.
 */

const classesFor = (state: Parameters<typeof chipVariants>[0]) =>
  chipVariants(state).split(/\s+/).filter(Boolean);

describe('BUG 40 regression guard — an outline chip has a visible edge', () => {
  it('the neutral outline border clears 3:1 in BOTH themes', () => {
    const cls = classesFor({ variant: 'outline', color: 'neutral' });

    expect(cls).toContain('border-neutral-500');

    // The two tiers that were measured and rejected.
    expect(cls).not.toContain('border-neutral-300'); // 1.42 / 1.91
    expect(cls).not.toContain('border-neutral-400'); // 2.42 / 2.53
  });

  it('leaves the text tier alone, which was never the problem', () => {
    const cls = classesFor({ variant: 'outline', color: 'neutral' });

    expect(cls).toContain('text-neutral-700');
    // No `dark:` on the neutral row: the scale already inverts through
    // the preset's CSS vars, and a dark variant would invert it twice.
    expect(cls.some((c) => c.startsWith('dark:text-neutral'))).toBe(false);
  });

  it('puts neutral on the same border tier as every other colour', () => {
    // The inconsistency that made the defect easy to miss: six rows at
    // 500 and one at 300.
    for (const color of [
      'neutral',
      'primary',
      'secondary',
      'success',
      'warning',
      'danger',
      'info',
    ] as const) {
      const cls = classesFor({ variant: 'outline', color });
      expect(cls).toContain(`border-${color}-500`);
    }
  });

  it('does not touch the solid and soft variants', () => {
    // The fix is scoped to the row that failed; the other variants carry
    // their own backgrounds and are not boundary-defined.
    const solid = classesFor({ variant: 'solid', color: 'neutral' });
    expect(solid).not.toContain('border-neutral-500');
  });
});
