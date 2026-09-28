import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Kbd>`.
 *
 * One axis, `size`, because a keycap has no intent: it is chrome around a
 * literal key, not a status or an action. Colour is fixed to the neutral
 * ramp, which auto-inverts through the preset's CSS vars, so the cap reads
 * as a raised surface in light and a recessed one in dark with no `dark:`
 * variant to keep in sync.
 *
 * The border is what makes the cap read as a cap, and it is at `-500`
 * rather than the `-300` a hairline invites. Measured on `learn/dash`
 * against both surfaces a keycap realistically sits on:
 *
 *   surface neutral-100 ... 1.09 vs page, 1.04 vs card
 *   surface neutral-200 ... 1.26 / 1.21
 *   border  neutral-300 ... 1.48 / 1.42
 *   border  neutral-400 ... 2.52 / 2.42
 *   border  neutral-500 ... 4.74 / 4.54   <- the first that clears 3:1
 *
 * The first draft assumed the `bg-neutral-100` surface would do the
 * separating and left the border at `-300`. It does not: a neutral surface
 * one step off the page is ~1.1:1 by construction, and in dark mode it
 * lands on exactly the same colour as a card, so the cap disappeared into
 * the panel and only the hairline was left. That is the same shape that
 * failed on the outline Chip (README-BUG § BUG 40), and it reached the
 * same tier for the same reason.
 *
 * The surface stays as a faint lift, not as the separator.
 *
 * `rounded-md` rather than a bare `rounded`, which is hard-coded at
 * 0.25rem and immune to the radius tokens (README-BUG § BUG 26).
 */
export const kbdVariants = tv({
  base: [
    'inline-flex items-center justify-center',
    'font-mono font-medium leading-none whitespace-nowrap select-none',
    'bg-neutral-100 text-neutral-700',
    'border border-neutral-500 rounded-md shadow-sm',
  ],
  variants: {
    size: {
      sm: 'h-5 min-w-5 px-1 text-2xs',
      md: 'h-6 min-w-6 px-1.5 text-xs',
      lg: 'h-7 min-w-7 px-2 text-sm',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type KbdVariants = VariantProps<typeof kbdVariants>;
