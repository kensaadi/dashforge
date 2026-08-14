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
import type { ImageProps, ImageRounded } from './image.types';

/** Corner-radius token → MUI `borderRadius` (multiples of `theme.shape.borderRadius`). */
const RADIUS: Record<ImageRounded, number | string> = {
  none: 0,
  sm: 1,
  md: 2,
  lg: 3,
  full: '9999px',
};

/**
 * Broken-image glyph — inline SVG fallback shown after a load error
 * when no custom `fallback` is provided.
 *
 * @internal
 */
function BrokenImageIcon() {
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
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m3 15 5-5 4 4" />
      <path d="m14 14 2-2 5 5" />
      <path d="m21 3-18 18" />
    </svg>
  );
}

/**
 * Dashforge MUI `<Image>` — a declarative, robust wrapper over the
 * native `<img>`. Zero eval, no data fetching: it renders a URL you
 * give it and adds the three things a bare `<img>` lacks.
 *
 * Key behaviors:
 * - **No layout shift** — `aspectRatio` (or `width` + `height`) reserves
 *   the box before load (CSS `aspect-ratio`, no JS measurement).
 * - **Loading skeleton** — a MUI `<Skeleton>` fills the reserved box
 *   while loading, and is skipped for already-cached images (no flash).
 * - **Graceful error** — on failure a muted fallback replaces the
 *   broken-image glyph (`fallback` to customise).
 * - Lazy by default (`loading="lazy"`); native `<img>` attributes are
 *   forwarded.
 *
 * The MUI-flavoured twin of `@dashforge/tw`'s `<Image>` — same public
 * API, MUI internals.
 *
 * This component does NOT depend on:
 * - Any data-fetching / eval — it is a pure presentational wrapper.
 * - The Dashforge form bridge or RBAC — it is display-only.
 *
 * @example
 * ```tsx
 * <Image src="/hero.jpg" alt="Team at work" aspectRatio={16 / 9} rounded="lg" />
 * ```
 */
export function Image(props: ImageProps) {
  const {
    src,
    alt,
    aspectRatio,
    width,
    height,
    fit = 'cover',
    rounded = 'none',
    loading = 'lazy',
    showSkeleton = true,
    fallback,
    access,
    visibleWhen,
    sx,
    style,
    onLoad,
    onError,
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

  // Resolve the already-cached case: a cached image may fire `onLoad`
  // before React attaches the handler, so we read `.complete` at mount.
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);

  const handleLoad: ReactEventHandler<HTMLImageElement> = (e) => {
    setLoaded(true);
    onLoad?.(e);
  };
  const handleError: ReactEventHandler<HTMLImageElement> = (e) => {
    setFailed(true);
    onError?.(e);
  };

  // Gated out entirely (hooks above already ran — rules of hooks safe).
  if (!isVisible || !accessState.visible) return null;

  // An image has no interactive state, so 'disable' / 'readonly' render it
  // dimmed and non-interactive rather than truly disabled.
  const accessDimmed = accessState.disabled || accessState.readonly;

  const hasReservedBox = aspectRatio != null || (width != null && height != null);
  const showSkeletonOverlay = showSkeleton && !loaded && !failed && hasReservedBox;

  const aspectRatioValue =
    aspectRatio == null
      ? undefined
      : typeof aspectRatio === 'number'
        ? `${aspectRatio} / 1`
        : aspectRatio;

  const imgStyle: CSSProperties = {
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
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        {...rest}
        style={imgStyle}
      />

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
          {fallback ?? <BrokenImageIcon />}
        </Box>
      )}
    </Box>
  );
}
