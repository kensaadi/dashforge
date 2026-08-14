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
import { imageVariants } from './image.variants.js';
import type { ImageProps } from './image.types.js';

/**
 * Broken-image glyph — inline SVG fallback shown after a load error
 * when no custom `fallback` is provided. Inline (no icon-library dep),
 * mirroring `<Avatar>`'s default user icon.
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
 * Dashforge TW `<Image>` — a declarative, robust wrapper over the
 * native `<img>`. Zero eval, no data fetching: it renders a URL you
 * give it, and adds the three things a bare `<img>` lacks.
 *
 *   1. **No layout shift** — pass `aspectRatio` (or `width` + `height`)
 *      and the box is reserved before the image loads (CSS
 *      `aspect-ratio`, no JS measurement).
 *   2. **Loading skeleton** — a `<Skeleton>` fills the reserved box
 *      while the image loads, and is skipped for already-cached images
 *      so there is no flash.
 *   3. **Graceful error** — on load failure a muted fallback replaces
 *      the broken-image glyph (`fallback` to customise).
 *
 * Lazy by default (`loading="lazy"`). Any native `<img>` attribute not
 * named here (`srcSet`, `sizes`, `decoding`, …) is forwarded to the
 * underlying element. The ref points at the `<img>`.
 *
 * @example
 * ```tsx
 * <Image src="/hero.jpg" alt="Team at work" aspectRatio={16 / 9} rounded="lg" />
 * <Image src={avatarUrl} alt="Jane Doe" width={48} height={48} rounded="full" />
 * ```
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(
  function Image(props, ref) {
    const themeDefaults = useComponentDefaults('Image');
    const merged: ImageProps = { ...themeDefaults?.defaults, ...props };
    const themeSlotProps = themeDefaults?.slotProps;

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
      slotProps,
      onLoad,
      onError,
      style,
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
    // official "adjust state during render" pattern (no effect, no flash),
    // so a previously-failed image doesn't keep showing its fallback.
    const [prevSrc, setPrevSrc] = useState(src);
    if (src !== prevSrc) {
      setPrevSrc(src);
      setLoaded(false);
      setFailed(false);
    }

    // Forward the ref AND resolve the already-cached case: for a cached
    // image `onLoad` may fire before React attaches the handler, so we
    // read `.complete` at mount and skip the skeleton flash.
    const handleRef = useCallback(
      (node: HTMLImageElement | null) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as MutableRefObject<HTMLImageElement | null>).current = node;
        if (node && node.complete && node.naturalWidth > 0) setLoaded(true);
      },
      [ref],
    );

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

    const v = imageVariants({ fit, rounded });

    // A skeleton needs a reserved box to paint into — without a known
    // shape there is no space, so we skip it (and there's layout shift,
    // documented as the reason to always pass aspectRatio / dimensions).
    const hasReservedBox = aspectRatio != null || (width != null && height != null);
    const showSkeletonOverlay = showSkeleton && !loaded && !failed && hasReservedBox;

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
        <img
          ref={handleRef}
          src={src}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          {...rest}
          className={cn(
            v.img(),
            themeSlotProps?.img?.className,
            slotProps?.img?.className,
          )}
          // Hide the broken-image glyph once we know it failed; the
          // fallback overlay takes its place.
          style={failed ? { visibility: 'hidden' } : undefined}
        />

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
            {fallback ?? <BrokenImageIcon />}
          </div>
        )}
      </div>
    );
  },
);

Image.displayName = 'Image';
