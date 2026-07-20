import { forwardRef, type ReactElement } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { linkVariants } from './link.variants.js';
import type { LinkProps } from './link.types.js';

/**
 * Dashforge TW `<Link>` — token-driven anchor primitive.
 *
 * Every visual axis (color / underline / weight / size) is
 * theme-configurable via `theme.components.Link.defaults` (Option C),
 * so a DS "Link is primary + semibold + uppercase" specification lives
 * in the theme, not in every JSX call site. A bare `<Link>text</Link>`
 * inherits that identity everywhere.
 *
 * See {@link LinkProps} for the full API surface and the router-
 * integration example via `asChild`.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  props,
  ref,
) {
  const themeDefaults = useComponentDefaults('Link');
  const merged: LinkProps = { ...themeDefaults?.defaults, ...props };

  const {
    color,
    underline,
    weight,
    size,
    startIcon,
    endIcon,
    external,
    asChild = false,
    href,
    target,
    rel,
    sx,
    slotProps,
    children,
    ...rest
  } = merged;

  // #112 safety-net — salvage a stray untyped `className`.
  const { className: consumerClassName, ...safeRest } = rest as typeof rest & {
    className?: string;
  };

  // Merged slotProps: theme slot classes appear FIRST in cn() so instance
  // slotProps win via tailwind-merge (later argument wins).
  const themeSlotProps = themeDefaults?.slotProps;
  const rootClasses = cn(
    linkVariants({ color, underline, weight, size }),
    themeSlotProps?.root?.className,
    themeSlotProps?.root?.className, slotProps?.root?.className,
    consumerClassName,
    sx,
  );

  // External-link a11y wire — apply target/rel only when the consumer
  // did not set them themselves. Idempotent + non-destructive.
  const externalAttrs = external
    ? {
        target: target ?? '_blank',
        rel: rel ?? 'noopener noreferrer',
      }
    : { target, rel };

  if (asChild) {
    // In dev, nudge the consumer if they passed icons alongside asChild —
    // the Slot pattern paints classes onto a foreign child, and there is
    // no seam for us to inject start/end icon wrappers.
    if (
      process.env.NODE_ENV !== 'production' &&
      (startIcon != null || endIcon != null)
    ) {
      // eslint-disable-next-line no-console -- dev-only nudge.
      console.warn(
        '[@dashforge/tw] <Link asChild> ignores startIcon / endIcon — the ' +
          'child element renders its own content. Move the icons inside the ' +
          'child instead.',
      );
    }
    return (
      <Slot
        ref={ref}
        className={rootClasses}
        {...externalAttrs}
        {...safeRest}
      >
        {children as ReactElement}
      </Slot>
    );
  }

  const startIconClasses = cn(
    'inline-flex items-center shrink-0',
    themeSlotProps?.startIcon?.className,
    themeSlotProps?.startIcon?.className, slotProps?.startIcon?.className,
  );
  const endIconClasses = cn(
    'inline-flex items-center shrink-0',
    themeSlotProps?.endIcon?.className,
    themeSlotProps?.endIcon?.className, slotProps?.endIcon?.className,
  );

  return (
    <a
      ref={ref}
      href={href}
      className={rootClasses}
      {...externalAttrs}
      {...safeRest}
    >
      {startIcon != null && <span className={startIconClasses}>{startIcon}</span>}
      {children}
      {endIcon != null && <span className={endIconClasses}>{endIcon}</span>}
    </a>
  );
});

Link.displayName = 'Link';
