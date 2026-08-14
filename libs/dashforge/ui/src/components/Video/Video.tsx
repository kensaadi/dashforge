import {
  useCallback,
  useContext,
  useState,
  type CSSProperties,
  type ReactEventHandler,
} from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useAccessState } from '../../hooks/useAccessState';
import type { VideoProps, VideoRounded } from './video.types';

/** Corner-radius token → MUI `borderRadius` (multiples of `theme.shape.borderRadius`). */
const RADIUS: Record<VideoRounded, number | string> = {
  none: 0,
  sm: 1,
  md: 2,
  lg: 3,
  full: '9999px',
};

/**
 * Broken-media glyph — inline SVG fallback shown after a load error
 * when no custom `fallback` is provided.
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
 * Dashforge MUI `<Video>` — the moving-image twin of `<Image>`. A
 * declarative, robust wrapper over the native `<video>`. Zero eval, no
 * data fetching: it renders a URL you give it and adds what a bare
 * `<video>` lacks.
 *
 * Key behaviors:
 * - **No layout shift** — `aspectRatio` (or `width` + `height`) reserves
 *   the box before load.
 * - **Loading skeleton** — a MUI `<Skeleton>` fills the reserved box
 *   while the first frame loads, skipped when a `poster` is given and for
 *   already-buffered video (no flash).
 * - **Graceful error** — on failure a muted fallback replaces the player.
 * - Controls on by default; native `<video>` attributes are forwarded,
 *   and `<source>` children are supported for multi-format delivery.
 *
 * The MUI-flavoured twin of `@dashforge/tw`'s `<Video>`.
 *
 * @example
 * ```tsx
 * <Video src="/demo.mp4" poster="/demo.jpg" aspectRatio={16 / 9} rounded="lg" />
 * ```
 */
export function Video(props: VideoProps) {
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
    style,
    onLoadedData,
    onError,
    children,
    ...rest
  } = props;

  // Gating — hooks always called (rules of hooks); the early return follows.
  const bridge = useContext(DashFormContext);
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const accessState = useAccessState(access);

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Reset load / error state when the source changes in place — React's
  // "adjust state during render" pattern (no effect, no flash).
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setLoaded(false);
    setFailed(false);
  }

  // Resolve the already-buffered case: a cached video may reach
  // HAVE_CURRENT_DATA before React attaches the handler, so we read
  // `.readyState` at mount.
  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && node.readyState >= 2) setLoaded(true);
  }, []);

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

  const hasReservedBox = aspectRatio != null || (width != null && height != null);
  const showSkeletonOverlay =
    showSkeleton && !loaded && !failed && hasReservedBox && poster == null;

  const aspectRatioValue =
    aspectRatio == null
      ? undefined
      : typeof aspectRatio === 'number'
        ? `${aspectRatio} / 1`
        : aspectRatio;

  const videoStyle: CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: fit,
    ...(failed ? { visibility: 'hidden' } : null),
  };

  return (
    <Box
      aria-disabled={accessDimmed || undefined}
      style={style}
      sx={[
        {
          position: 'relative',
          overflow: 'hidden',
          display: 'block',
          borderRadius: RADIUS[rounded],
          aspectRatio: aspectRatioValue,
          width,
          height,
        },
        ...(accessDimmed ? [{ opacity: 0.6, pointerEvents: 'none' as const }] : []),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={controls}
        preload={preload}
        onLoadedData={handleLoadedData}
        onError={handleError}
        {...rest}
        style={videoStyle}
      >
        {children}
      </video>

      {showSkeletonOverlay && (
        <Skeleton
          variant="rectangular"
          animation="pulse"
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      )}

      {failed && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            color: 'text.disabled',
          }}
        >
          {fallback ?? <BrokenMediaIcon />}
        </Box>
      )}
    </Box>
  );
}
