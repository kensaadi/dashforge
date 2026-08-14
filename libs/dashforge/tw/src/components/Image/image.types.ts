import type { ImgHTMLAttributes, ReactNode } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import type { Engine } from '@dashforge/ui-core';
import type { ImageVariants } from './image.variants.js';

/**
 * Subset of `<Image>` props theme-configurable via
 * `theme.components.Image.defaults` (Option C).
 */
export type ImageVariantProps = Pick<ImageVariants, 'fit' | 'rounded'>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Image?: {
      defaults?: Partial<ImageVariantProps>;
      slotProps?: ImageSlotProps;
    };
  }
}

export interface ImageSlotProps {
  /** Wrapper element override. */
  root?: { className?: string };
  /** `<img>` element override. */
  img?: { className?: string };
  /** Loading-skeleton overlay override. */
  skeleton?: { className?: string };
  /** Error-fallback overlay override. */
  fallback?: { className?: string };
}

/**
 * Props for `<Image>`.
 *
 * A thin, declarative wrapper over the native `<img>` — zero eval, no
 * data fetching — with the robustness a native `<img>` lacks:
 *
 *  1. **No layout shift.** Give `aspectRatio` (or `width` + `height`)
 *     and the box is reserved before the image loads (CSS
 *     `aspect-ratio`, no JS measurement).
 *  2. **Loading skeleton.** While the image loads, a `<Skeleton>` fills
 *     the reserved box. It is skipped automatically for already-cached
 *     images (no flash).
 *  3. **Graceful error.** On load failure a muted fallback replaces the
 *     broken-image glyph — pass your own via `fallback`.
 *  4. **Lazy by default** (`loading="lazy"`).
 *
 * Any native `<img>` attribute not listed here (`srcSet`, `sizes`,
 * `crossOrigin`, `referrerPolicy`, `decoding`, …) is forwarded to the
 * underlying element.
 *
 * Note on privacy: an external `src` is fetched by the browser from
 * that host (egress). Self-host the asset (same-origin / your CDN) to
 * keep it inside your boundary.
 *
 * @example
 * ```tsx
 * <Image src="/hero.jpg" alt="Team at work" aspectRatio={16 / 9} rounded="lg" />
 * <Image src={avatarUrl} alt="Jane Doe" width={48} height={48} rounded="full" />
 * <Image src={maybeBroken} alt="Product" aspectRatio={1} fallback={<MyPlaceholder />} />
 * ```
 */
export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'className'> {
  /** Image source URL. Same-origin / data: keeps it inside your boundary; an external host is egress. */
  src: string;

  /**
   * Alternative text (accessibility). Describe what the image conveys;
   * use `alt=""` for purely decorative images so assistive tech skips it.
   */
  alt: string;

  /**
   * Locks the box shape before load to prevent layout shift — a number
   * (`16 / 9`, `1`) or a CSS `aspect-ratio` string (`'16 / 9'`). When
   * set, the image fills the box via `object-fit`.
   */
  aspectRatio?: number | string;

  /**
   * How the image fills its box — CSS `object-fit`.
   * @default 'cover'
   */
  fit?: ImageVariants['fit'];

  /**
   * Corner radius token, clipped via `overflow-hidden`.
   * @default 'none'
   */
  rounded?: ImageVariants['rounded'];

  /**
   * Native lazy/eager loading. Lazy defers off-screen images.
   * @default 'lazy'
   */
  loading?: 'lazy' | 'eager';

  /**
   * Show a `<Skeleton>` while the image loads. Requires a reserved box
   * (`aspectRatio`, or both `width` and `height`) — without one there
   * is no space to paint it, so it is skipped.
   * @default true
   */
  showSkeleton?: boolean;

  /**
   * Content shown when the image fails to load. Defaults to a muted
   * surface with a broken-image glyph.
   */
  fallback?: ReactNode;

  /**
   * RBAC access requirement. When the current user is unauthorized:
   * `onUnauthorized: 'hide'` → the image does not render; `'disable'` /
   * `'readonly'` → it renders dimmed and non-interactive (an image has no
   * true disabled state). Resolved against the nearest `RbacProvider`.
   */
  access?: AccessRequirement;

  /**
   * Reactive visibility predicate evaluated against the form engine — the
   * image renders only when it returns `true` (e.g. show a preview once a
   * file field has a value). No-op outside a `<DashForm>`.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /** Root-level Tailwind override (wins via `tailwind-merge`). */
  sx?: string;

  /** Per-slot overrides. */
  slotProps?: ImageSlotProps;
}
