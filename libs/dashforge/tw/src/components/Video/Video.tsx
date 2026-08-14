import {
  forwardRef,
  useCallback,
  useContext,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type ReactEventHandler,
} from 'react';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useAccessState } from '../../hooks/useAccessState.js';
import { cn } from '../../utils/cn.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { videoVariants } from './video.variants.js';
import type { VideoProps } from './video.types.js';

/**
 * Broken-media glyph — inline SVG fallback shown after a load error
 * when no custom `fallback` is provided. Inline (no icon-library dep),
 * mirroring `<Image>`'s broken-image glyph.
 *
 * @internal
 */
function BrokenMediaIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 2 22 22" />
      <path d="M10.66 5H14a2 2 0 0 1 2 2v3.34l1 1L22 8v8" />
      <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2" />
    </svg>
  );
}

/**
 * Dashforge TW `<Video>` — the moving-image twin of `<Image>`. A
 * declarative, robust wrapper over the native `<video>`. Zero eval, no
 * data fetching: it renders a URL you give it and adds what a bare
 * `<video>` lacks.
 *
 *   1. **No layout shift** — pass `aspectRatio` (or `width` + `height`)
 *      and the box is reserved before the video loads.
 *   2. **Loading skeleton** — a `<Skeleton>` fills the reserved box
 *      while the first frame loads; skipped when a `poster` is given
 *      and for already-buffered video (no flash).
 *   3. **Graceful error** — on load failure a muted fallback replaces
 *      the player (`fallback` to customise).
 *
 * Controls on by default. Any native `<video>` attribute not named here
 * (`autoPlay`, `loop`, `muted`, `playsInline`, `crossOrigin`, …) is
 * forwarded; pass `<source>` children for multi-format delivery. The
 * ref points at the `<video>`.
 *
 * @example
 * ```tsx
 * <Video src="/demo.mp4" poster="/demo.jpg" aspectRatio={16 / 9} rounded="lg" />
 * <Video src="/loop.webm" aspectRatio={1} autoPlay loop muted playsInline controls={false} />
 * ```
 */
export const Video = forwardRef<HTMLVideoElement, VideoProps>(
  function Video(props, ref) {
    const themeDefaults = useComponentDefaults('Video');
    const merged: VideoProps = { ...themeDefaults?.defaults, ...props };
    const themeSlotProps = themeDefaults?.slotProps;

    const {
      src,
      poster,
      aspectRatio,
      width,
      height,
      fit = 'cover',
      rounded = 'none',
      controls = true,
      preload = 'metadata',
      showSkeleton = true,
      fallback,
      access,
      visibleWhen,
      sx,
      slotProps,
      onLoadedData,
      onError,
      style,
      children,
      ...rest
    } = merged;

    // Gating — hooks are always called (rules of hooks), the early return
    // comes after. `visibleWhen` is a no-op outside a <DashForm>.
    const bridge = useContext(DashFormContext);
    const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
    const accessState = useAccessState(access);

    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    // Reset load / error state when the source changes in place — React's
    // official "adjust state during render" pattern (no effect, no flash).
    const [prevSrc, setPrevSrc] = useState(src);
    if (src !== prevSrc) {
      setPrevSrc(src);
      setLoaded(false);
      setFailed(false);
    }

    // Forward the ref AND resolve the already-buffered case: a cached
    // video may reach HAVE_CURRENT_DATA before React attaches the
    // handler, so we read `.readyState` at mount and skip the skeleton.
    const handleRef = useCallback(
      (node: HTMLVideoElement | null) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as MutableRefObject<HTMLVideoElement | null>).current = node;
        if (node && node.readyState >= 2) setLoaded(true);
      },
      [ref],
    );

    const handleLoadedData: ReactEventHandler<HTMLVideoElement> = (e) => {
      setLoaded(true);
      onLoadedData?.(e);
    };
    const handleError: ReactEventHandler<HTMLVideoElement> = (e) => {
      setFailed(true);
      onError?.(e);
    };

    // Gated out entirely (hooks above already ran — rules of hooks safe).
    if (!isVisible || !accessState.visible) return null;

    // A video has no interactive state, so 'disable' / 'readonly' render it
    // dimmed and non-interactive rather than truly disabled.
    const accessDimmed = accessState.disabled || accessState.readonly;

    const v = videoVariants({ fit, rounded });

    // A skeleton needs a reserved box to paint into, and is redundant when
    // a poster is present (the poster is the loading visual).
    const hasReservedBox = aspectRatio != null || (width != null && height != null);
    const showSkeletonOverlay =
      showSkeleton && !loaded && !failed && hasReservedBox && poster == null;

    const rootStyle: CSSProperties = { ...style };
    if (aspectRatio != null) {
      rootStyle.aspectRatio = typeof aspectRatio === 'number' ? `${aspectRatio} / 1` : aspectRatio;
    }
    if (width != null) rootStyle.width = width as CSSProperties['width'];
    if (height != null) rootStyle.height = height as CSSProperties['height'];

    return (
      <div
        aria-disabled={accessDimmed || undefined}
        className={cn(
          v.root(),
          accessDimmed && 'opacity-60 pointer-events-none',
          sx,
          themeSlotProps?.root?.className,
          slotProps?.root?.className,
        )}
        style={Object.keys(rootStyle).length ? rootStyle : undefined}
      >
        <video
          ref={handleRef}
          src={src}
          poster={poster}
          controls={controls}
          preload={preload}
          onLoadedData={handleLoadedData}
          onError={handleError}
          {...rest}
          className={cn(
            v.video(),
            themeSlotProps?.video?.className,
            slotProps?.video?.className,
          )}
          // Hide the failed player; the fallback overlay takes its place.
          style={failed ? { visibility: 'hidden' } : undefined}
        >
          {children}
        </video>

        {showSkeletonOverlay && (
          <Skeleton
            variant="rectangle"
            animation="pulse"
            sx={cn(
              v.skeleton(),
              themeSlotProps?.skeleton?.className,
              slotProps?.skeleton?.className,
            )}
          />
        )}

        {failed && (
          <div
            className={cn(
              v.fallback(),
              themeSlotProps?.fallback?.className,
              slotProps?.fallback?.className,
            )}
          >
            {fallback ?? <BrokenMediaIcon />}
          </div>
        )}
      </div>
    );
  },
);

Video.displayName = 'Video';
