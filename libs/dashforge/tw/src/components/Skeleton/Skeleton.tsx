import type { CSSProperties } from 'react';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { skeletonVariants } from './skeleton.variants.js';
import type { SkeletonProps } from './skeleton.types.js';

/**
 * Dashforge TW `<Skeleton>` — loading placeholder primitive.
 *
 * Renders as a non-interactive `<span aria-hidden="true">` so screen
 * readers skip it. The surrounding component is responsible for
 * announcing loading state via `aria-busy` or `aria-live` if needed.
 *
 * Variants:
 *   - `variant` — `text` (default, line shape) / `rectangle` / `circle`
 *   - `animation` — `pulse` (default) / `wave` / `none`
 *
 * Both animations are gated by `prefers-reduced-motion` (WCAG 2.3.3).
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" width="200px" />
 * <Skeleton variant="rectangle" width="100%" height="120px" />
 * <Skeleton variant="circle" width="40px" />
 * ```
 */
export function Skeleton(props: SkeletonProps) {
  const themeDefaults = useComponentDefaults('Skeleton');
  const merged: SkeletonProps = { ...themeDefaults?.defaults, ...props };
  const { variant = 'text', animation = 'pulse', width, height, sx, slotProps } = merged;
  const v = skeletonVariants({ variant, animation });

  // Width / height come through as inline style — Tailwind doesn't
  // know about arbitrary user-supplied lengths. We default `circle`'s
  // height to `width` so consumers don't have to repeat themselves.
  const style: CSSProperties = {};
  if (width != null) style.width = width;
  if (height != null) {
    style.height = height;
  } else if (variant === 'circle' && width != null) {
    style.height = width;
  }

  return (
    <span
      aria-hidden="true"
      role="presentation"
      className={cn(v.root(), sx, slotProps?.root?.className)}
      style={style}
    />
  );
}
