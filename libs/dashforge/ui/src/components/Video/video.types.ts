import type { VideoHTMLAttributes, ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import type { AccessRequirement } from '@dashforge/rbac';
import type { Engine } from '@dashforge/ui-core';

/** How the video fills its box — CSS `object-fit`. */
export type VideoFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

/** Corner-radius token. */
export type VideoRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';

/**
 * Props for `<Video>` — the MUI-flavoured twin of the Tailwind
 * `@dashforge/tw` `<Video>`, and the moving-image sibling of `<Image>`.
 * Same public API; MUI internals.
 *
 * A thin, declarative wrapper over the native `<video>` — zero eval, no
 * data fetching — that adds what a bare `<video>` lacks:
 *
 *  1. **No layout shift.** Give `aspectRatio` (or `width` + `height`)
 *     and the box is reserved before the video loads.
 *  2. **Loading skeleton.** A MUI `<Skeleton>` fills the reserved box
 *     while the first frame loads, skipped when a `poster` is given and
 *     for already-buffered video (no flash).
 *  3. **Graceful error.** On failure a muted fallback replaces the
 *     player (`fallback` to customise).
 *  4. **Controls on by default** (`controls`).
 *
 * Any native `<video>` attribute not listed here (`crossOrigin`,
 * `controlsList`, `disablePictureInPicture`, …) is forwarded. For
 * multi-format delivery, pass `<source>` children instead of `src`.
 *
 * Privacy note: an external `src` is fetched by the browser from that
 * host (egress). Autoplay requires `muted` in most browsers.
 *
 * @example
 * ```tsx
 * <Video src="/demo.mp4" poster="/demo.jpg" aspectRatio={16 / 9} rounded="lg" />
 * <Video src="/loop.webm" aspectRatio={1} autoPlay loop muted playsInline controls={false} />
 * ```
 */
export interface VideoProps
  extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src' | 'className' | 'poster'> {
  /** Video source URL. Same-origin / data: keeps it inside your boundary; an external host is egress. Omit and pass `<source>` children for multi-format delivery. */
  src?: string;

  /**
   * Poster image URL shown before playback / while the first frame
   * loads. Doubles as the anti-layout-shift and loading visual.
   */
  poster?: string;

  /**
   * Locks the box shape before load to prevent layout shift — a number
   * (`16 / 9`, `1`) or a CSS `aspect-ratio` string (`'16 / 9'`).
   */
  aspectRatio?: number | string;

  /**
   * How the video fills its box — CSS `object-fit`.
   * @default 'cover'
   */
  fit?: VideoFit;

  /**
   * Corner radius token.
   * @default 'none'
   */
  rounded?: VideoRounded;

  /**
   * Show the native player controls.
   * @default true
   */
  controls?: boolean;

  /**
   * How much to preload. `'metadata'` fetches dimensions/duration only.
   * @default 'metadata'
   */
  preload?: 'none' | 'metadata' | 'auto';

  /**
   * Show a `<Skeleton>` while the first frame loads. Requires a reserved
   * box (`aspectRatio`, or both `width` and `height`) and no `poster`,
   * else it is skipped.
   * @default true
   */
  showSkeleton?: boolean;

  /**
   * Content shown when the video fails to load. Defaults to a muted
   * surface with a broken-media glyph.
   */
  fallback?: ReactNode;

  /**
   * RBAC access requirement. When the current user is unauthorized:
   * `onUnauthorized: 'hide'` → the video does not render; `'disable'` /
   * `'readonly'` → it renders dimmed and non-interactive. Resolved against
   * the nearest `RbacProvider`.
   */
  access?: AccessRequirement;

  /**
   * Reactive visibility predicate evaluated against the form engine — the
   * video renders only when it returns `true`. No-op outside a `<DashForm>`.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /** MUI style override applied to the root wrapper. */
  sx?: SxProps<Theme>;
}
