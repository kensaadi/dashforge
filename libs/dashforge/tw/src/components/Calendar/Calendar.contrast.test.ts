// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { calendarDayVariants } from './calendar.variants';

/**
 * Regression guard for BUG 31 in libs/dashforge/README-BUG.md.
 *
 * A sibling-month day is muted but **selectable**, so its label is an
 * active control's text and WCAG 1.4.3 applies. The cell is 14px at weight
 * 400, which is normal text, so the threshold is 4.5:1.
 *
 * Measured on the running app with `getComputedStyle`, against the real
 * surfaces (`rgb(250,250,250)` light, `rgb(10,10,10)` dark):
 *
 *   tier            light    dark
 *   neutral-400     2.42     2.53     <- what shipped; fails both
 *   neutral-500     4.54     4.18     <- passes light, FAILS dark
 *   neutral-600     7.49     7.85     <- passes both
 *
 * `neutral-500` is the pivot of the scale: it stays rgb(115,115,115) in
 * both themes, so it cannot clear a near-black surface. That is why the
 * obvious one-step fix is not the right one, and why this is pinned.
 *
 * The disabled cells are NOT part of this: at 1.23:1 they are well under
 * the threshold, and WCAG exempts the text of inactive components. Their
 * job is to look unavailable.
 *
 * jsdom resolves no palette, so what is asserted here is the token tier.
 * The contrast numbers above are the browser half and live in the entry.
 */

const classesFor = (state: Parameters<typeof calendarDayVariants>[0]) =>
  calendarDayVariants(state).split(/\s+/).filter(Boolean);

describe('BUG 31 regression guard — a selectable day stays readable', () => {
  it('a sibling-month day uses a tier that passes WCAG in BOTH themes', () => {
    const cls = classesFor({ siblingMonth: true });

    expect(cls).toContain('text-neutral-600');

    // The two tiers that were measured and rejected.
    expect(cls).not.toContain('text-neutral-400'); // 2.42 / 2.53 — fails both
    expect(cls).not.toContain('text-neutral-500'); // 4.54 / 4.18 — fails dark
  });

  it('keeps sibling-month visibly muted against the current month', () => {
    // The fix must not turn a sibling day into a current-month day: the
    // convention it implements is still worth keeping, just above the
    // readability floor.
    const sibling = classesFor({ siblingMonth: true });
    const current = classesFor({});

    expect(current).toContain('text-neutral-900');
    expect(sibling).not.toContain('text-neutral-900');
  });

  it('keeps the disabled treatment distinct from the sibling one', () => {
    // The original report's complaint: one idiom for two opposite
    // meanings. These must not converge on the same token.
    const disabled = classesFor({ disabled: true });
    const sibling = classesFor({ siblingMonth: true });

    expect(disabled).toContain('text-neutral-300');
    expect(disabled).toContain('opacity-60');
    expect(sibling).not.toContain('opacity-60');

    const tier = (c: string[]) => c.find((x) => x.startsWith('text-neutral-'));
    expect(tier(disabled)).not.toBe(tier(sibling));
  });

  it('a cell that is both sibling and disabled reads as disabled', () => {
    // tailwind-merge resolves the overlap; the unavailable meaning has to
    // win, or a past day in the trailing week looks pickable.
    const both = classesFor({ siblingMonth: true, disabled: true });
    expect(both).toContain('text-neutral-300');
    expect(both).not.toContain('text-neutral-600');
  });
});
