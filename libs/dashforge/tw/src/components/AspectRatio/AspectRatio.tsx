import { forwardRef, type CSSProperties, type ElementType } from 'react';
import { cn } from '../../utils/cn.js';
import type { AspectRatioProps } from './aspectRatio.types.js';

/**
 * `<AspectRatio>` — locks the aspect ratio of its child container,
 * regardless of width. The classic use is responsive images and
 * embedded media: an `<img>` that takes 100% of the available width
 * but always renders at 16:9 (or 1:1, or whatever the source ratio is)
 * — no jumping layouts during image load, no whitespace below the
 * media, no JS measurement.
 *
 * Implementation: native CSS `aspect-ratio` property. Supported in
 * every browser shipped from 2021 onward (Chrome 88, Firefox 89,
 * Safari 15, Edge 88). No padding-bottom hack — that workaround
 * predates the native property and brings ugly absolute-positioning
 * requirements on the child.
 *
 * Why a component if it's "just one CSS property"?
 *   Two reasons:
 *     1. Discoverability — `<AspectRatio ratio={16/9}>` documents the
 *        intent at the call site. `style={{ aspectRatio: '16/9' }}` is
 *        the same thing functionally, but harder to spot in a 200-line
 *        component file.
 *     2. Composition — pairs naturally with `sx="rounded-xl overflow-hidden"`
 *        for the canonical "rounded clipped media" pattern. Forgetting
 *        the `overflow-hidden` is the #1 mistake we want to prevent
 *        through documentation (it's in this component's MDX, at the
 *        top of the Notes).
 *
 * Child contract:
 *   The single child is expected to fill the container — typically
 *   `<img>` / `<video>` with `className="w-full h-full object-cover"`.
 *   We don't force this via CSS (the consumer might want a centered
 *   icon instead of a filling image) — but it's the 99% case, and the
 *   docs show it first.
 */
export const AspectRatio = forwardRef<HTMLElement, AspectRatioProps>(
  function AspectRatio(props, ref) {
    const {
      ratio = 1,
      as,
      sx,
      style,
      children,
      ...rest
    } = props;

    /*
     * Normalise to a CSS `aspect-ratio` string. The CSS property
     * accepts both `16/9` and `16 / 9` (with spaces), but for safety
     * we convert numbers to the canonical `N / 1` form — `aspectRatio: 1.7777`
     * works too, but produces an arbitrary-looking value in DevTools.
     */
    const aspectRatioValue = typeof ratio === 'number' ? `${ratio} / 1` : ratio;

    const mergedStyle: CSSProperties = {
      aspectRatio: aspectRatioValue,
      ...style,
    };

    const classes = cn('w-full', sx);
    const Tag = (as ?? 'div') as ElementType;

    return (
      <Tag ref={ref as never} className={classes} style={mergedStyle} {...rest}>
        {children}
      </Tag>
    );
  },
);

AspectRatio.displayName = 'AspectRatio';
