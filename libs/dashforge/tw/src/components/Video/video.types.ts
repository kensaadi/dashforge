import type { VideoHTMLAttributes, ReactNode } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import type { Engine } from '@dashforge/ui-core';
import type { VideoVariants } from './video.variants.js';

/**
 * Subset of `<Video>` props theme-configurable via
 * `theme.components.Video.defaults` (Option C).
 */
export type VideoVariantProps = Pick<VideoVariants, 'fit' | 'rounded'>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Video?: {
      defaults?: Partial<VideoVariantProps>;
      slotProps?: VideoSlotProps;
    };
  }
}

export interface VideoSlotProps {
  /** Wrapper element override. */
  root?: { className?: string };
  /** `<video>` element override. */
  video?: { className?: string };
  /** Loading-skeleton overlay override. */
  skeleton?: { className?: string };
  /** Error-fallback overlay override. */
  fallback?: { className?: string };
}

/**
 * Props for `<Video>` — the moving-image twin of `<Image>`.
 *
 * A thin, declarative wrapper over the native `<video>` — zero eval, no
 * data fetching — with the robustness a bare `<video>` lacks:
 *
 *  1. **No layout shift.** Give `aspectRatio` (or `width` + `height`)
 *     and the box is reserved before the video loads (CSS
 *     `aspect-ratio`, no JS measurement).
 *  2. **Loading skeleton.** While the first frame loads, a `<Skeleton>`
 *     fills the reserved box. Skipped when a `poster` is given (the
 *     poster is its own loading visual) and for already-buffered video.
 *  3. **Graceful error.** On load failure a muted fallback replaces the
 *     player — pass your own via `fallback`.
 *  4. **Controls on by default** (`controls`).
 *
 * Any native `<video>` attribute not listed here (`crossOrigin`,
 * `disablePictureInPicture`, `controlsList`, …) is forwarded to the
 * underlying element. For multi-format delivery, pass `<source>`
 * elements as `children` instead of `src`.
 *
 * Note on privacy: an external `src` is fetched by the browser from
 * that host (egress). Self-host the asset (same-origin / your CDN) to
 * keep it inside your boundary. Autoplay requires `muted` in most
 * browsers.
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
   * (`16 / 9`, `1`) or a CSS `aspect-ratio` string (`'16 / 9'`). When
   * set, the video fills the box via `object-fit`.
   */
  aspectRatio?: number | string;

  /**
   * How the video fills its box — CSS `object-fit`.
   * @default 'cover'
   */
  fit?: VideoVariants['fit'];

  /**
   * Corner radius token, clipped via `overflow-hidden`.
   * @default 'none'
   */
  rounded?: VideoVariants['rounded'];

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
   * box (`aspectRatio`, or both `width` and `height`) and no `poster`
   * (the poster is its own loading visual), else it is skipped.
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
   * `'readonly'` → it renders dimmed and non-interactive (a video has no
   * true disabled state). Resolved against the nearest `RbacProvider`.
   */
  access?: AccessRequirement;

  /**
   * Reactive visibility predicate evaluated against the form engine — the
   * video renders only when it returns `true`. No-op outside a
   * `<DashForm>`.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /** Root-level Tailwind override (wins via `tailwind-merge`). */
  sx?: string;

  /** Per-slot overrides. */
  slotProps?: VideoSlotProps;
}
