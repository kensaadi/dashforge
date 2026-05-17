import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `containerVariants` — centered max-width wrapper for page layouts.
 *
 * Architectural role:
 *
 *   Every web app has the same pattern at the page-root level: a div
 *   that's `mx-auto`, capped at some `max-w-*`, with responsive
 *   horizontal padding. Without Container, every page rewrites:
 *
 *     <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 *
 *   Container collapses that into one typed prop set, with size names
 *   that mirror Tailwind's breakpoint vocabulary so the muscle memory
 *   carries over (`size="lg"` ↔ `max-w-screen-lg`).
 *
 * Size axis — maps to Tailwind's `max-w-screen-*` aliases:
 *   • sm     → max-w-screen-sm     (640px)
 *   • md     → max-w-screen-md     (768px)
 *   • lg     → max-w-screen-lg     (1024px) — most common doc/content cap
 *   • xl     → max-w-screen-xl     (1280px) — default; comfortable for full apps
 *   • 2xl    → max-w-screen-2xl    (1536px) — wide dashboards
 *   • fluid  → no max-width at all (full bleed, padding still applies)
 *
 * Padding axis (`px`):
 *   • true (default) — responsive horizontal padding (px-4 sm:px-6 lg:px-8)
 *     The canonical Tailwind responsive padding ramp. Designed to keep
 *     edges from kissing the viewport on mobile and breathing more on
 *     larger screens.
 *   • false — no padding. Use when the consumer wants full bleed AND
 *     handles edge padding inside (e.g. a hero section with its own
 *     internal spacing scale).
 *
 * Center content axis (`centerContent`):
 *   • true  — turns the Container into a flex column with items-center
 *     so the page content stacks centered horizontally. Common for
 *     marketing pages, sign-in flows, "single artifact" layouts.
 *   • false (default) — children flow normally (block stacking).
 */
export const containerVariants = tv({
  base: 'mx-auto w-full',

  variants: {
    size: {
      sm:    'max-w-screen-sm',
      md:    'max-w-screen-md',
      lg:    'max-w-screen-lg',
      xl:    'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      fluid: '',
    },

    /*
     * Responsive padding ramp. `false` skips it entirely so the
     * consumer can supply custom padding via `sx` when needed.
     */
    px: {
      true:  'px-4 sm:px-6 lg:px-8',
      false: '',
    },

    /*
     * Stacks children centered. Mutually compatible with all sizes —
     * a fluid container with centerContent is the canonical "marketing
     * hero" layout.
     */
    centerContent: {
      true:  'flex flex-col items-center',
      false: '',
    },
  },

  defaultVariants: {
    size: 'xl',
    px: true,
    centerContent: false,
  },
});

export type ContainerVariants = VariantProps<typeof containerVariants>;
