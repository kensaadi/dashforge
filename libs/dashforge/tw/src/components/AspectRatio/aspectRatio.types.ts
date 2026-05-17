import type { ElementType, HTMLAttributes, ReactNode } from 'react';

/**
 * Props for `<AspectRatio>` — content-shape primitive that locks the
 * aspect ratio of its child regardless of width.
 *
 * Implementation: uses the native CSS `aspect-ratio` property
 * (supported in all current browsers since 2021 — Chrome 88+, Firefox 89+,
 * Safari 15+, Edge 88+). No padding-bottom hack, no JS measurement.
 *
 * `ratio` accepts:
 *   • A number — width / height. `16/9` is 1.7777…, `1` is square,
 *     `4/3` is 1.333…, `21/9` is ultrawide cinema.
 *   • A string with the CSS `aspect-ratio` syntax, e.g. `'16 / 9'`,
 *     `'4 / 3'`. Useful when you want the source ratio to read clearly
 *     in the JSX (`ratio="16 / 9"` is more legible than `ratio={16/9}`).
 *
 * The component renders a single element with `aspect-ratio: X` and
 * `width: 100%`. The child is expected to fill it — typically an
 * `<img>` or `<video>` with `className="w-full h-full object-cover"`.
 *
 * Why not a TV recipe?
 *   The ratio is arbitrary (`16/9`, `1`, `2.35`, anything). Tailwind
 *   has `aspect-square` / `aspect-video` / `aspect-[16/9]` arbitrary
 *   values, but enumerating every conceivable ratio in TV would be
 *   pointless. We set `style={{ aspectRatio }}` directly — pure CSS
 *   property, no class purge concerns.
 */
export interface AspectRatioProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /**
   * Aspect ratio as width/height. Number (`16/9`) or CSS string
   * (`'16 / 9'`). Default `1` (square).
   */
  ratio?: number | string;

  /**
   * The child that fills the locked-ratio container. Typically an
   * `<img>` or `<video>` with `className="w-full h-full object-cover"`.
   */
  children?: ReactNode;

  /**
   * Override the rendered HTML tag. Defaults to `'div'`.
   */
  as?: ElementType;

  /**
   * Utility classes appended to the base. Resolved via `tailwind-merge`.
   * Common overrides: `sx="rounded-xl overflow-hidden"` to clip the
   * child's overflow (image bleeds otherwise).
   */
  sx?: string;
}
