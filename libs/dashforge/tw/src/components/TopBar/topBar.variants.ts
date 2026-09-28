import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<TopBar>`.
 *
 * Slots:
 *   - `root`   — outer `<header>` (or `<div>` with `asDiv`)
 *   - `start`  — left region (shrink-to-content)
 *   - `center` — middle region (grows to fill)
 *   - `end`    — right region (shrink-to-content)
 */
export const topBarVariants = tv({
  slots: {
    root: [
      'flex items-center gap-3 w-full px-4 shrink-0',
      'bg-neutral-50 border-b border-neutral-200',
    ],
    /*
     * `shrink-0` removed (README-BUG § BUG 42): it sat next to `min-w-0`,
     * which only has an effect on an item that is allowed to shrink, so the
     * two contradicted each other and `shrink-0` won. The slot kept its
     * content width whatever happened, which meant a long brand pushed
     * `center` and `end` out of the bar instead of ellipsing.
     *
     * Only the already-broken case changes: where there is room, a
     * shrinkable item and a non-shrinkable one lay out identically.
     */
    start: 'flex items-center gap-2 min-w-0',
    center: 'flex items-center gap-2 min-w-0 flex-1',
    end: 'flex items-center gap-2 shrink-0',
  },
  variants: {
    height: {
      sm: { root: 'h-12 text-sm' },
      md: { root: 'h-14' },
      lg: { root: 'h-16' },
    },
    sticky: {
      true: { root: 'sticky top-0 z-30' },
    },
  },
  defaultVariants: {
    height: 'md',
    sticky: true,
  },
});

export type TopBarVariants = VariantProps<typeof topBarVariants>;

/**
 * Recipe for `<TopBarBrand>`.
 *
 * `min-w-0` plus `truncate` on both lines is the load-bearing part: a bar
 * is a fixed-height row, and a long subtitle (a file path, which is the
 * case this exists for) would otherwise push the `center` and `end` slots
 * out of the bar rather than ellipsing.
 */
export const topBarBrandVariants = tv({
  slots: {
    root: 'flex items-center gap-2 min-w-0',
    logo: 'shrink-0 flex items-center',
    text: 'flex flex-col justify-center min-w-0 leading-tight',
    title: 'truncate text-sm font-semibold text-neutral-900',
    subtitle: 'truncate text-xs text-neutral-500',
  },
});
