import type { ImgHTMLAttributes, ReactNode } from 'react';
import type { ClassValue } from 'tailwind-variants';
import type { BoxProps } from '../Box/box.types.js';

// AvatarVariantProps + declaration merging appear near the end of this
// file, after AvatarShape / AvatarSize / AvatarColor / AvatarTone are
// declared. See below.

/**
 * Avatar size scale — maps to spacing tokens via avatar.variants.ts:
 *   - xs → w-5  / 20px
 *   - sm → w-7  / 28px
 *   - md → w-9  / 36px  ← default
 *   - lg → w-12 / 48px
 *   - xl → w-16 / 64px
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Avatar shape — semantic shortcut. Maps internally to a Box-style
 * `radius` value:
 *   - circle → 'full'
 *   - rounded → 'lg'
 *   - square → 'none'
 *
 * When both `shape` and `radius` are set, `radius` wins (explicit
 * token reference takes precedence over semantic shortcut).
 */
export type AvatarShape = 'circle' | 'rounded' | 'square';

/**
 * Intent color — drives the fallback bg + text colors when no `src`
 * is provided (or when the image fails to load). Reuses the 7
 * Dashforge intent tokens.
 */
export type AvatarColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/**
 * Tone shade for the fallback background — gives type-safe access to
 * any specific shade within the chosen `color` palette. When omitted,
 * the default "soft" treatment is applied (bg-{color}-100 +
 * text-{color}-900). When set, both bg and text are computed:
 *   - tones 50-400  → bg-{color}-{tone} + text-{color}-900 (dark text)
 *   - tones 500-900 → bg-{color}-{tone} + text-{color}-50  (light text)
 *
 * For colors outside the token palette (custom hex, gradient, image
 * patterns), use the `sx` escape hatch with arbitrary Tailwind
 * utilities.
 */
export type AvatarTone =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

/**
 * Props for `<Avatar>`.
 *
 * Fallback resolution chain:
 *   1. `src` set + image loads OK   → render `<img>`
 *   2. `src` set + image fails      → render initials from `name`
 *      (or a generic user icon if `name` is also absent)
 *   3. `src` absent + `name` set    → render initials from `name`
 *      (first letter of first two words, uppercased)
 *   4. Everything absent            → render a generic user icon
 *
 * No `access` / `visibleWhen` — Avatar is display-only by category.
 * For visibility gating, wrap in `<Box>` (which has both props since
 * Sprint 4.4).
 */
export interface AvatarProps {
  // ─── Image source ──────────────────────────────────────────────
  /** Image URL. Falls back to initials/icon on load failure. */
  src?: string;

  /**
   * `alt` text for the image. **Required when `src` is set** (a11y
   * — screen readers need a name). When `src` is absent, the alt is
   * implied from `name`.
   */
  alt?: string;

  /** Additional `<img>` HTML attributes (sizes, loading, srcSet, …). */
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;

  // ─── Fallback ──────────────────────────────────────────────────
  /**
   * Person / entity name. Auto-generates initials when `src` is
   * absent or the image fails to load. Algorithm: take the first
   * letter of the first two whitespace-separated words, uppercased.
   * "Maya Rodriguez" → "MR". "Cher" → "C". Empty → generic icon.
   */
  name?: string;

  // ─── Visual ────────────────────────────────────────────────────
  /**
   * Shape — semantic shortcut. Override with `radius` for fine
   * control on the Box token scale.
   * @default 'circle'
   */
  shape?: AvatarShape;

  /**
   * Border radius — same enum as `<Box rounded>` (Box token scale).
   * When set, overrides the `shape` mapping. Useful for matching a
   * specific Card/Box radius (e.g., `radius='2xl'`).
   */
  radius?: BoxProps['rounded'];

  /** @default 'md' */
  size?: AvatarSize;

  /**
   * Intent color used for the fallback background. Ignored when the
   * image loads successfully.
   * @default 'neutral'
   */
  color?: AvatarColor;

  /**
   * Specific shade within the `color` palette (TS-safe). When set,
   * overrides the default "soft" treatment. See `AvatarTone` for the
   * full scale.
   */
  tone?: AvatarTone;

  // ─── Override ──────────────────────────────────────────────────
  /** Root-element class shortcut (string or clsx-compatible value). */
  sx?: ClassValue;

  /** Standard React className — appended to the root via `cn()`. */
  className?: string;

  /**
   * Optional custom fallback ReactNode — replaces both initials and
   * the generic icon when the image is absent / fails. Useful for
   * Avatar-with-emoji or Avatar-with-custom-icon patterns. When
   * passed, `name` is ignored for initials generation but kept as
   * `alt` semantic.
   *
   * **NB**: this is the ONE exception to the "no fallback prop —
   * only name" rule from the spec. Kept narrow because emoji /
   * custom icon avatars are common enough that forcing `sx` for
   * them would be friction.
   */
  fallbackIcon?: ReactNode;
}

/**
 * Props for `<AvatarGroup>` — thin horizontal wrapper.
 *
 * Renders the first `max` children visibly (with negative-margin
 * overlap), then an overflow indicator avatar with the remaining
 * count. Each child Avatar inherits `size` from the group unless it
 * overrides explicitly. Optional `ring-2 ring-white` halo on each
 * child via the group's `withRing` prop (visually separates
 * overlapping avatars on a busy background).
 */
export interface AvatarGroupProps {
  /** Avatar children. */
  children: ReactNode;

  /**
   * Max number of avatars to render visibly. Excess collapses into
   * a trailing "+N" overflow indicator.
   * @default 4
   */
  max?: number;

  /**
   * Size applied to every child Avatar (unless the child explicitly
   * overrides). Propagated via React.cloneElement.
   * @default 'md'
   */
  size?: AvatarSize;

  /**
   * Negative margin between overlapping avatars. Tighter = more
   * overlap. Looser = more space.
   * @default 'sm'
   */
  spacing?: 'xs' | 'sm' | 'md';

  /**
   * Wrap each child avatar with a `ring-2 ring-white` halo for
   * separation on busy backgrounds.
   * @default true
   */
  withRing?: boolean;

  /** Standard className. */
  className?: string;

  /** sx escape hatch. */
  sx?: ClassValue;
}

/**
 * Subset of `<Avatar>` props theme-configurable via
 * `theme.components.Avatar.defaults` (Option C).
 */
export type AvatarVariantProps = Pick<
  AvatarProps,
  'shape' | 'radius' | 'size' | 'color' | 'tone'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Avatar?: {
      defaults?: Partial<AvatarVariantProps>;
    };
  }
}
