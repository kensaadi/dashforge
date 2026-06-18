import type { ButtonVariants } from '../Button/button.variants.js';

/**
 * IconButton size overrides — applied ON TOP of `buttonVariants(...)`.
 *
 * Button's `size` axis sets `h-X` + `px-Y` (rectangular). For
 * IconButton we need a SQUARE shape, so we:
 *   - zero out the horizontal padding (`px-0`)
 *   - set an explicit width that matches the height (`w-N` mirrors the
 *     `h-N` from Button's size variant)
 *
 * The `aspect-square` utility provides belt-and-braces in the edge
 * case where Tailwind purges the explicit `w-N` (e.g., when the user
 * passes `size` dynamically and the JIT can't statically see all
 * combinations).
 *
 * Token propagation: `w-N` resolves to `var(--df-tw-spacing-N)`
 * through `dashforgePreset()`, identical to how `h-N` works for
 * Button. `patchTheme({ spacing: { 10: '2.75rem' } })` patches both
 * Button height and IconButton size in lockstep.
 */
type IconButtonSize = NonNullable<ButtonVariants['size']>;

export const ICON_BUTTON_SIZE_OVERRIDES: Record<IconButtonSize, string> = {
  sm: 'w-8 px-0',
  md: 'w-10 px-0',
  lg: 'w-12 px-0',
};

/** Always-applied layout primitives — not token-driven (geometric CSS). */
export const ICON_BUTTON_BASE = 'aspect-square inline-flex items-center justify-center';
