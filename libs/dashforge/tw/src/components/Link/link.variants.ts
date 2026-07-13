import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `linkVariants` — the token-driven recipe for `<Link>`.
 *
 * Every axis maps to Dashforge palette tokens routed through
 * `dashforgePreset()`. The DS anchors visual identity via
 * `theme.components.Link.defaults` (Option C): once the design system
 * defines "Link is primary, semibold, always-underlined at size sm",
 * a bare `<Link>text</Link>` renders exactly that — no per-instance
 * repetition.
 *
 * Axes:
 *   - `color`     — palette intent. Matches `Typography.color` so a
 *                   Link inside a paragraph inherits the same intent
 *                   language. `inherit` opts out (used when the link
 *                   sits on a coloured surface and should paint the
 *                   surface text colour).
 *   - `underline` — `always` (persistent), `hover` (on hover/focus),
 *                   `none` (never). Persistent underline is idiomatic
 *                   for prose; `hover` is idiomatic for buttons/nav.
 *   - `weight`    — font-weight step. Overlaps intentionally with
 *                   Typography's `weight`.
 *   - `size`      — font-size step, matches Typography scale
 *                   (`text-xs → text-lg`).
 *
 * `dark:` variants are applied on the color palettes (except `neutral`,
 * which auto-inverts via the preset CSS-var swap — double-inverting it
 * would break dark mode) — same rationale as `Typography` and `Chip`.
 */
export const linkVariants = tv({
  base: [
    // Layout — inline-flex so start/end icons align vertically without
    // consumer boilerplate. `gap-1` between text and icons.
    'inline-flex items-center gap-1',
    // Anchor semantics — cursor + focus-visible ring using primary token.
    'cursor-pointer',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:rounded',
    // Motion-reduce safe transition on color / decoration.
    'transition-colors',
    'motion-reduce:transition-none',
  ],
  variants: {
    color: {
      // `inherit` — escape hatch for links inside coloured surfaces.
      inherit:   'text-inherit',
      primary:   'text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300',
      secondary: 'text-secondary-700 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-300',
      // `neutral` — auto-inverts via preset. No `dark:` variant.
      neutral:   'text-neutral-900 hover:text-neutral-950',
      muted:     'text-neutral-600 hover:text-neutral-900',
    },
    underline: {
      always: 'underline underline-offset-2',
      hover:  'no-underline hover:underline underline-offset-2',
      none:   'no-underline',
    },
    weight: {
      normal:   'font-normal',
      medium:   'font-medium',
      semibold: 'font-semibold',
      bold:     'font-bold',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    color:     'primary',
    underline: 'hover',
    weight:    'normal',
    size:      'md',
  },
});

export type LinkVariants = VariantProps<typeof linkVariants>;
