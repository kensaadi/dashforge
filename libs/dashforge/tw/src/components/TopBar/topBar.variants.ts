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
    start: 'flex items-center gap-2 min-w-0 shrink-0',
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
