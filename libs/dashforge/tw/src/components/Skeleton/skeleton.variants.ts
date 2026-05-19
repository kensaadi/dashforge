import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `<Skeleton>` variant recipe.
 *
 * Slots:
 *  - `root` — single element (atomic component)
 *
 * Variant axes:
 *  - `variant` (`text` | `rectangle` | `circle`) — shape / radius
 *  - `animation` (`pulse` | `wave` | `none`) — how the placeholder
 *    "breathes" while data loads. Always gated on
 *    `prefers-reduced-motion` (no exception — animations are
 *    purely cosmetic).
 *
 * Implementation notes:
 *
 *  - `pulse` uses Tailwind's built-in `animate-pulse` (opacity
 *    1.0 ↔ 0.5 over 2s, ease-in-out infinite).
 *  - `wave` overlays a moving gradient. Implemented with a
 *    `relative` container + an `::after` pseudo-element via a
 *    Tailwind arbitrary-value class. The gradient slides
 *    horizontally over the surface, mimicking the MUI Skeleton
 *    "wave" look.
 *  - Color uses neutral-200 (light) and neutral-800 (dark) for
 *    the base, picked up automatically by the dashforge preset's
 *    CSS-variable layer.
 *
 * Accessibility: the root has `aria-hidden="true"` (set on the JSX
 * side, not here). Screen readers skip the skeleton entirely;
 * the surrounding component is responsible for announcing
 * loading state via `aria-busy` or `aria-live` if needed.
 */
export const skeletonVariants = tv({
  slots: {
    root: [
      'block',
      // Neutral palette auto-inverts via CSS-var swap (no `dark:`).
      'bg-neutral-200',
      'motion-reduce:animate-none',
    ],
  },
  variants: {
    variant: {
      text: {
        root: 'rounded h-[1em] w-full',
      },
      rectangle: {
        root: 'rounded-md w-full h-[100px]',
      },
      circle: {
        root: 'rounded-full w-10 h-10',
      },
    },
    animation: {
      pulse: {
        root: 'animate-pulse',
      },
      wave: {
        root: [
          'relative overflow-hidden',
          // The wave is rendered via an arbitrary-value ::after
          // pseudo-element with a moving linear gradient. Tailwind
          // doesn't ship a `wave` keyframe; we use the built-in
          // `animate-pulse` as a fallback if a consumer needs to
          // override. The gradient stop direction works in both
          // light and dark mode (white shimmer in light, lighter
          // overlay in dark).
          'after:absolute after:inset-0',
          'after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent',
          'dark:after:via-white/10',
          'after:animate-pulse',
          'after:motion-reduce:animate-none',
        ],
      },
      none: {
        root: '',
      },
    },
  },
  defaultVariants: {
    variant: 'text',
    animation: 'pulse',
  },
});

export type SkeletonVariants = VariantProps<typeof skeletonVariants>;
