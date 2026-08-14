import type { ImgHTMLAttributes, ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import type { AccessRequirement } from '@dashforge/rbac';
import type { Engine } from '@dashforge/ui-core';

/** How the image fills its box — CSS `object-fit`. */
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

/** Corner-radius token. */
export type ImageRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';

/**
 * Props for `<Image>` — the MUI-flavoured twin of the Tailwind
 * `@dashforge/tw` `<Image>`. Same public API; MUI internals.
 *
 * A thin, declarative wrapper over the native `<img>` — zero eval, no
 * data fetching — that adds what a bare `<img>` lacks:
 *
 *  1. **No layout shift.** Give `aspectRatio` (or `width` + `height`)
 *     and the box is reserved before the image loads.
 *  2. **Loading skeleton.** A MUI `<Skeleton>` fills the reserved box
 *     while loading, skipped for already-cached images (no flash).
 *  3. **Graceful error.** On failure a muted fallback replaces the
 *     broken-image glyph (`fallback` to customise).
 *  4. **Lazy by default** (`loading="lazy"`).
 *
 * Any native `<img>` attribute not listed here (`srcSet`, `sizes`,
 * `crossOrigin`, `decoding`, …) is forwarded to the underlying element.
 *
 * Privacy note: an external `src` is fetched by the browser from that
 * host (egress). Self-host the asset to keep it inside your boundary.
 *
 * @example
 * ```tsx
 * <Image src="/hero.jpg" alt="Team at work" aspectRatio={16 / 9} rounded="lg" />
 * <Image src={avatarUrl} alt="Jane Doe" width={48} height={48} rounded="full" />
 * ```
 */
export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'className'> {
  /** Image source URL. Same-origin / data: keeps it inside your boundary; an external host is egress. */
  src: string;

  /**
   * Alternative text (accessibility). Describe what the image conveys;
   * use `alt=""` for purely decorative images.
   */
  alt: string;

  /**
   * Locks the box shape before load to prevent layout shift — a number
   * (`16 / 9`, `1`) or a CSS `aspect-ratio` string (`'16 / 9'`).
   */
  aspectRatio?: number | string;

  /**
   * How the image fills its box — CSS `object-fit`.
   * @default 'cover'
   */
  fit?: ImageFit;

  /**
   * Corner radius token.
   * @default 'none'
   */
  rounded?: ImageRounded;

  /**
   * Native lazy/eager loading.
   * @default 'lazy'
   */
  loading?: 'lazy' | 'eager';

  /**
   * Show a `<Skeleton>` while the image loads. Requires a reserved box
   * (`aspectRatio`, or both `width` and `height`), else it is skipped.
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
   * `'readonly'` → it renders dimmed and non-interactive. Resolved against
   * the nearest `RbacProvider`.
   */
  access?: AccessRequirement;

  /**
   * Reactive visibility predicate evaluated against the form engine — the
   * image renders only when it returns `true`. No-op outside a `<DashForm>`.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /** MUI style override applied to the root wrapper. */
  sx?: SxProps<Theme>;
}
