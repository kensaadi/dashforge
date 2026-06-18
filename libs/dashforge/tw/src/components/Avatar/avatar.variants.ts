import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Avatar>`.
 *
 * Axes:
 *   - `size`   — 5 steps (xs/sm/md/lg/xl), maps to w/h spacing tokens
 *                + matching text-size for the initials inside.
 *   - `radius` — 7 steps (none/sm/md/lg/xl/2xl/full), same scale as
 *                `<Box rounded>`. `shape` prop in the component maps
 *                semantically: circle → full, rounded → lg, square → none.
 *   - `color`  — 7 intents. Drives the FALLBACK bg+text only (image
 *                surface is independent of color).
 *
 * The `color` × `tone` combo is resolved at render time in
 * `Avatar.tsx` via compound lookup — see the SOFT_TINT and TONE
 * tables there. We do NOT expand the matrix exhaustively in this TV
 * recipe (it would be 7 colors × 10 tones × 5 sizes = 350 rules; the
 * runtime resolver keeps the recipe slim).
 */
export const avatarVariants = tv({
  slots: {
    /** Outer wrapper — sets dimensions + radius + ring + alignment. */
    root: [
      'relative inline-flex items-center justify-center shrink-0',
      'overflow-hidden align-middle',
      'select-none',
      // The font weight + leading are baked into root so initials slot
      // inherits them without an extra class layer.
      'font-medium leading-none',
    ],
    /** `<img>` slot — fills the root, object-cover for crop-to-square. */
    img: 'block w-full h-full object-cover',
    /** Initials text slot. */
    initials: 'uppercase tracking-tight',
    /** Generic user icon SVG fallback. */
    icon: 'w-1/2 h-1/2 opacity-80',
  },
  variants: {
    size: {
      xs: {
        root: 'w-5 h-5 text-[10px]',
        initials: '',
      },
      sm: {
        root: 'w-7 h-7 text-xs',
        initials: '',
      },
      md: {
        root: 'w-9 h-9 text-sm',
        initials: '',
      },
      lg: {
        root: 'w-12 h-12 text-base',
        initials: '',
      },
      xl: {
        root: 'w-16 h-16 text-xl',
        initials: '',
      },
    },
    radius: {
      none: { root: 'rounded-none' },
      sm:   { root: 'rounded-sm' },
      md:   { root: 'rounded-md' },
      lg:   { root: 'rounded-lg' },
      xl:   { root: 'rounded-xl' },
      '2xl':{ root: 'rounded-2xl' },
      full: { root: 'rounded-full' },
    },
  },
  defaultVariants: {
    size: 'md',
    radius: 'full',
  },
});

export type AvatarVariants = VariantProps<typeof avatarVariants>;

/**
 * Default "soft" fallback treatment per intent — what you get when
 * `tone` is omitted. Light tinted bg + dark text for legibility.
 * Neutral row uses no `dark:` because the dashforgePreset() CSS-var
 * swap auto-inverts neutral; color rows keep `dark:` for the
 * intentional palette shift (palette colors don't auto-invert).
 */
export const AVATAR_SOFT_FALLBACK: Record<string, string> = {
  neutral:   'bg-neutral-100 text-neutral-900',
  primary:   'bg-primary-100 text-primary-900 dark:bg-primary-950 dark:text-primary-100',
  secondary: 'bg-secondary-100 text-secondary-900 dark:bg-secondary-950 dark:text-secondary-100',
  success:   'bg-success-100 text-success-900 dark:bg-success-950 dark:text-success-100',
  warning:   'bg-warning-100 text-warning-900 dark:bg-warning-950 dark:text-warning-100',
  danger:    'bg-danger-100 text-danger-900 dark:bg-danger-950 dark:text-danger-100',
  info:      'bg-info-100 text-info-900 dark:bg-info-950 dark:text-info-100',
};

/**
 * Specific-tone resolver — when the consumer sets `tone={500}` (or
 * any other value), this lookup builds the matching bg + text class.
 *
 * Text color logic:
 *   - tones 50-400  → dark text (uses the 900 step)
 *   - tones 500-900 → light text (uses the 50 step)
 *
 * Tailwind JIT requires literal class strings, so we enumerate them
 * explicitly here. The bundle cost is ~70 lines, acceptable for the
 * type-safety win of letting consumers pick any palette shade.
 */
export const AVATAR_TONE_FALLBACK: Record<string, Record<number, string>> = {
  neutral: {
    50:  'bg-neutral-50 text-neutral-900',
    100: 'bg-neutral-100 text-neutral-900',
    200: 'bg-neutral-200 text-neutral-900',
    300: 'bg-neutral-300 text-neutral-900',
    400: 'bg-neutral-400 text-neutral-900',
    500: 'bg-neutral-500 text-neutral-50',
    600: 'bg-neutral-600 text-neutral-50',
    700: 'bg-neutral-700 text-neutral-50',
    800: 'bg-neutral-800 text-neutral-50',
    900: 'bg-neutral-900 text-neutral-50',
  },
  primary: {
    50:  'bg-primary-50 text-primary-900',
    100: 'bg-primary-100 text-primary-900',
    200: 'bg-primary-200 text-primary-900',
    300: 'bg-primary-300 text-primary-900',
    400: 'bg-primary-400 text-primary-900',
    500: 'bg-primary-500 text-primary-50',
    600: 'bg-primary-600 text-primary-50',
    700: 'bg-primary-700 text-primary-50',
    800: 'bg-primary-800 text-primary-50',
    900: 'bg-primary-900 text-primary-50',
  },
  secondary: {
    50:  'bg-secondary-50 text-secondary-900',
    100: 'bg-secondary-100 text-secondary-900',
    200: 'bg-secondary-200 text-secondary-900',
    300: 'bg-secondary-300 text-secondary-900',
    400: 'bg-secondary-400 text-secondary-900',
    500: 'bg-secondary-500 text-secondary-50',
    600: 'bg-secondary-600 text-secondary-50',
    700: 'bg-secondary-700 text-secondary-50',
    800: 'bg-secondary-800 text-secondary-50',
    900: 'bg-secondary-900 text-secondary-50',
  },
  success: {
    50:  'bg-success-50 text-success-900',
    100: 'bg-success-100 text-success-900',
    200: 'bg-success-200 text-success-900',
    300: 'bg-success-300 text-success-900',
    400: 'bg-success-400 text-success-900',
    500: 'bg-success-500 text-success-50',
    600: 'bg-success-600 text-success-50',
    700: 'bg-success-700 text-success-50',
    800: 'bg-success-800 text-success-50',
    900: 'bg-success-900 text-success-50',
  },
  warning: {
    50:  'bg-warning-50 text-warning-900',
    100: 'bg-warning-100 text-warning-900',
    200: 'bg-warning-200 text-warning-900',
    300: 'bg-warning-300 text-warning-900',
    400: 'bg-warning-400 text-warning-900',
    500: 'bg-warning-500 text-warning-50',
    600: 'bg-warning-600 text-warning-50',
    700: 'bg-warning-700 text-warning-50',
    800: 'bg-warning-800 text-warning-50',
    900: 'bg-warning-900 text-warning-50',
  },
  danger: {
    50:  'bg-danger-50 text-danger-900',
    100: 'bg-danger-100 text-danger-900',
    200: 'bg-danger-200 text-danger-900',
    300: 'bg-danger-300 text-danger-900',
    400: 'bg-danger-400 text-danger-900',
    500: 'bg-danger-500 text-danger-50',
    600: 'bg-danger-600 text-danger-50',
    700: 'bg-danger-700 text-danger-50',
    800: 'bg-danger-800 text-danger-50',
    900: 'bg-danger-900 text-danger-50',
  },
  info: {
    50:  'bg-info-50 text-info-900',
    100: 'bg-info-100 text-info-900',
    200: 'bg-info-200 text-info-900',
    300: 'bg-info-300 text-info-900',
    400: 'bg-info-400 text-info-900',
    500: 'bg-info-500 text-info-50',
    600: 'bg-info-600 text-info-50',
    700: 'bg-info-700 text-info-50',
    800: 'bg-info-800 text-info-50',
    900: 'bg-info-900 text-info-50',
  },
};
