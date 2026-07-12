import type { SkeletonVariants } from './skeleton.variants.js';

/**
 * Subset of `<Skeleton>` props theme-configurable via
 * `theme.components.Skeleton.defaults` (Option C).
 */
export type SkeletonVariantProps = Pick<SkeletonVariants, 'variant' | 'animation'>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Skeleton?: {
      defaults?: Partial<SkeletonVariantProps>;
    };
  }
}

export interface SkeletonSlotProps {
  /** Root element override. */
  root?: { className?: string };
}

/**
 * Props for `<Skeleton>`.
 *
 * Visual loading placeholder shown while data / images / components
 * are being prepared. Three shapes (`variant`), three animations
 * (`animation`), and free-form `width` / `height` for arbitrary
 * dimensions.
 *
 * Rendered as a non-interactive `<span aria-hidden="true">` so screen
 * readers skip it entirely.
 *
 * Compose by nesting: e.g. avatar + two text lines for a card
 * placeholder.
 *
 * @example
 * ```tsx
 * <Skeleton variant="text"      width="200px" />
 * <Skeleton variant="rectangle" width="100%" height="120px" />
 * <Skeleton variant="circle"    width="40px" />
 *
 * // Compose to mimic a card shape
 * <div className="flex gap-3">
 *   <Skeleton variant="circle" width="48px" />
 *   <div className="flex flex-col gap-2 flex-1">
 *     <Skeleton variant="text" width="60%" />
 *     <Skeleton variant="text" width="40%" />
 *   </div>
 * </div>
 * ```
 */
export interface SkeletonProps
  extends Pick<SkeletonVariants, 'variant' | 'animation'> {
  /**
   * CSS width (e.g. `"200px"`, `"100%"`, `"60%"`).
   *
   * Defaults: `text` → `100%`, `rectangle` → `100%`, `circle` → `40px`.
   */
  width?: string;

  /**
   * CSS height (e.g. `"1em"`, `"120px"`).
   *
   * Defaults: `text` → `1em`, `rectangle` → `100px`, `circle` → matches `width`.
   */
  height?: string;

  /** Root-level Tailwind override (wins via `tailwind-merge`). */
  sx?: string;

  /** Per-slot overrides. */
  slotProps?: SkeletonSlotProps;
}
