import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useState,
  type ReactElement,
} from 'react';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import {
  AVATAR_SOFT_FALLBACK,
  AVATAR_TONE_FALLBACK,
  avatarVariants,
} from './avatar.variants.js';
import type {
  AvatarGroupProps,
  AvatarProps,
  AvatarShape,
  AvatarSize,
} from './avatar.types.js';
import type { BoxProps } from '../Box/box.types.js';

/**
 * Generic user icon — inline SVG fallback when no `src` and no
 * `name` are provided. Stroke uses `currentColor` so it inherits the
 * resolved fallback text color. Same convention as Calendar +
 * Autocomplete + Alert icons (no icon-library dep).
 *
 * @internal
 */
function DefaultUserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

/**
 * Map the semantic `shape` shortcut to a Box-style `radius` token.
 * Used only when `radius` is NOT explicitly passed (explicit wins).
 *
 * @internal
 */
function shapeToRadius(shape: AvatarShape): BoxProps['rounded'] {
  switch (shape) {
    case 'circle':
      return 'full';
    case 'rounded':
      return 'lg';
    case 'square':
      return 'none';
  }
}

/**
 * Extract initials from a name string. Strategy:
 *   - Split by whitespace, filter empty.
 *   - Take the first letter of the first 2 tokens, uppercased.
 *   - "Maya Rodriguez" → "MR"
 *   - "Cher" → "C"
 *   - "  multiple   spaces  " → "MS" (if 2+ words after trim)
 *   - "" → "" (empty string — caller falls back to icon)
 *
 * @internal
 */
function initialsFromName(name?: string): string {
  if (!name) return '';
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '';
  return (tokens[0]![0]! + (tokens[1]?.[0] ?? '')).toUpperCase();
}

/**
 * `<Avatar>` — image / initials / icon visual identity.
 *
 * Fallback chain (top to bottom — first match wins):
 *   1. `src` set + image loads OK    → render `<img>`
 *   2. `src` set + image fails       → render initials from `name`
 *   3. `src` absent + `name` set     → render initials from `name`
 *   4. `fallbackIcon` set            → render that ReactNode
 *   5. Nothing                        → render generic user SVG
 *
 * Color resolution (only for fallback content, image surface is
 * independent):
 *   - `color="primary"` only           → soft default (bg-100, text-900)
 *   - `color="primary" tone={500}`     → bg-primary-500 + text-primary-50
 *   - Outside the palette              → use `sx`
 *
 * No `access` / `visibleWhen` — Avatar is display-only by category.
 * For visibility gating, wrap in `<Box>` (which has both since
 * Sprint 4.4).
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  props,
  ref
) {
  const themeDefaults = useComponentDefaults('Avatar');
  const merged: AvatarProps = { ...themeDefaults?.defaults, ...props };
  const {
    src,
    alt,
    imgProps,
    name,
    shape = 'circle',
    radius,
    size = 'md',
    color = 'neutral',
    tone,
    fallbackIcon,
    sx,
    className,
    ...rest
  } = merged;

  // Track image-load failures so we can fall through to initials/icon
  // dynamically. `imgLoaded` distinguishes between "still loading"
  // (don't show fallback yet — would flash) and "loaded successfully"
  // (don't paint a fallback color underneath, which would peek through
  // transparent PNGs).
  const [imgFailed, setImgFailed] = useState(false);

  // Resolve final radius: explicit `radius` prop wins over `shape`.
  const finalRadius = radius ?? shapeToRadius(shape);

  // Compute base classes from the TV recipe.
  const v = avatarVariants({ size, radius: finalRadius });

  // Fallback color resolution. `tone` (when set) drives the specific
  // shade; otherwise the soft-default lookup is used.
  const fallbackTone =
    tone !== undefined
      ? AVATAR_TONE_FALLBACK[color]?.[tone] ?? AVATAR_SOFT_FALLBACK[color]
      : AVATAR_SOFT_FALLBACK[color];

  // Image is "successful" when src is set AND the load hasn't failed.
  const showImage = !!src && !imgFailed;
  const initials = initialsFromName(name);

  // The root carries the fallback color ONLY when we're showing the
  // fallback content. Painting it underneath a successful image is
  // wrong if the image has transparency.
  const fallbackBgClasses = !showImage ? fallbackTone : '';

  const rootClasses = cn(
    v.root(),
    fallbackBgClasses,
    sx,
    className
  );

  // Pick which fallback to render — priority: initials > custom icon > generic SVG.
  const fallbackContent: ReactElement = initials ? (
    <span className={v.initials()}>{initials}</span>
  ) : fallbackIcon ? (
    <span className="inline-flex items-center justify-center w-full h-full">
      {fallbackIcon}
    </span>
  ) : (
    <span className={v.icon() + ' inline-flex items-center justify-center'}>
      <DefaultUserIcon />
    </span>
  );

  return (
    <span
      ref={ref}
      className={rootClasses}
      role="img"
      aria-label={alt ?? name ?? undefined}
      {...rest}
    >
      {showImage ? (
        // Inner img is DECORATIVE (alt="") — the parent span carries
        // the accessible name via role="img" + aria-label. This avoids
        // a duplicate role="img" announcement and matches MUI's a11y
        // pattern.
        <img
          src={src}
          alt=""
          onError={() => setImgFailed(true)}
          {...imgProps}
          className={cn(v.img(), imgProps?.className)}
        />
      ) : (
        fallbackContent
      )}
    </span>
  );
});

Avatar.displayName = 'Avatar';

// ─── AvatarGroup ─────────────────────────────────────────────────

/**
 * Horizontal spacing tokens for the group overlap. Negative margin
 * pulls each child onto the previous, simulating the "stack of
 * avatars" pattern. Tokens map to spacing scale.
 *
 * @internal
 */
const GROUP_SPACING: Record<NonNullable<AvatarGroupProps['spacing']>, string> = {
  xs: '-space-x-1',
  sm: '-space-x-2',
  md: '-space-x-3',
};

/**
 * `<AvatarGroup>` — thin horizontal wrapper for overlapping avatars.
 *
 * Slices children to `max - 1` visible items and renders a trailing
 * "+N" overflow indicator with the remaining count (when more than
 * `max` children are passed).
 *
 * Each child Avatar inherits the group's `size` unless it explicitly
 * overrides. When `withRing` is `true` (default), each visible
 * Avatar gets a `ring-2 ring-white` halo so overlapping borders
 * stay visually separated.
 *
 * @example
 * ```tsx
 * <AvatarGroup max={3}>
 *   <Avatar name="Maya Rodriguez" color="primary" />
 *   <Avatar name="John Doe" color="success" />
 *   <Avatar name="Sara Chen" color="warning" />
 *   <Avatar name="Lila Park" color="info" />
 *   <Avatar name="Eve Kim" color="danger" />
 * </AvatarGroup>
 * // Renders: MR, JD, SC + a "+2" overflow chip
 * ```
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup(props, ref) {
    const {
      children,
      max = 4,
      size = 'md',
      spacing = 'sm',
      withRing = true,
      className,
      sx,
    } = props;

    const allChildren = Children.toArray(children).filter(isValidElement);
    const total = allChildren.length;
    const visibleCount = Math.min(total, max);
    const overflow = Math.max(0, total - visibleCount);

    // Decorate each visible child with size (if not overridden by the
    // child) and optional ring halo. cloneElement is the standard
    // React pattern for prop-injection across a children array.
    const visible = allChildren.slice(0, visibleCount).map((child, idx) => {
      const childProps = (child as ReactElement<AvatarProps>).props;
      const inheritedSize: AvatarSize = childProps.size ?? size;
      const ringClass = withRing ? 'ring-2 ring-neutral-50' : '';
      const mergedSx = cn(
        ringClass,
        childProps.sx as string | undefined,
        childProps.className
      );
      return cloneElement(child as ReactElement<AvatarProps>, {
        key: idx,
        size: inheritedSize,
        sx: mergedSx,
      });
    });

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center',
          GROUP_SPACING[spacing],
          sx,
          className
        )}
      >
        {visible}
        {overflow > 0 && (
          <Avatar
            // The overflow indicator IS an avatar (same dimensions /
            // radius), but with a +N text fallback rather than initials.
            // We pass an empty `name` and a custom `fallbackIcon` that
            // renders the count.
            size={size}
            color="neutral"
            sx={cn(withRing && 'ring-2 ring-neutral-50')}
            fallbackIcon={
              <span className="text-xs font-medium">+{overflow}</span>
            }
          />
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';
