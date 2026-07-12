import { forwardRef, useContext } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { Box } from '../Box/Box.js';
import type {
  CardActionAreaProps,
  CardContentProps,
  CardProps,
} from './card.types.js';

/**
 * `<Card>` — opinionated surface preset over `<Box>`.
 *
 * Thin alias that pre-fills card-shaped Box defaults (`outlined`,
 * `rounded='lg'`, `elevation=1`, no padding). Reads as `<Card>` in
 * consumer code while reusing every Box affordance: surface variants,
 * 7 intent colors, spacing scale, polymorphism, and the bridge
 * integration (`access` + `visibleWhen`) retrofitted to Box in 1.1.0.
 *
 * Restricted variant axis: only `'outlined' | 'elevated' | 'plain'`.
 * `'soft'` and `'solid'` are deliberately excluded — they belong to
 * Box (as `<Alert>`-shaped callouts) and to banners, not to cards.
 *
 * @example
 * ```tsx
 * // Most common — outlined card with content padding via CardContent
 * <Card>
 *   <CardContent>
 *     <Typography variant="h3">Title</Typography>
 *     <Typography variant="body">Body</Typography>
 *   </CardContent>
 * </Card>
 *
 * // Elevated, clickable, gated by RBAC (inherits access from Box)
 * <Card
 *   variant="elevated"
 *   elevation={2}
 *   access={{ resource: 'billing', action: 'read', onUnauthorized: 'hide' }}
 * >
 *   <CardActionArea onClick={openBilling}>
 *     <CardContent>
 *       <Typography variant="h3">Revenue</Typography>
 *     </CardContent>
 *   </CardActionArea>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  props,
  ref
) {
  const themeDefaults = useComponentDefaults('Card');
  const merged: CardProps = { ...themeDefaults?.defaults, ...props };
  const {
    variant = 'outlined',
    rounded = 'lg',
    elevation = 1,
    p = 0,
    children,
    ...rest
  } = merged;

  return (
    <Box
      ref={ref}
      variant={variant}
      rounded={rounded}
      elevation={elevation}
      p={p}
      {...rest}
    >
      {children}
    </Box>
  );
});

Card.displayName = 'Card';

/**
 * `<CardContent>` — padded inner section of a Card.
 *
 * Semantic alias for an inner `<Box p={4}>`. The default padding step
 * (4) maps to `--df-tw-spacing-4` (1rem) via the dashforgePreset,
 * matching common card-content paddings across MUI / shadcn / Chakra.
 * Override `p` to dial up/down per the spacing token scale.
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardContent p={6}>  {/* bigger inner padding *}/}
 *     <Typography variant="h3">Spacious card</Typography>
 *   </CardContent>
 * </Card>
 * ```
 */
export function CardContent({
  p = 4,
  children,
  className,
  sx,
}: CardContentProps) {
  return (
    <Box p={p} sx={cn(className, sx as string | undefined)}>
      {children}
    </Box>
  );
}

CardContent.displayName = 'CardContent';

/**
 * `<CardActionArea>` — clickable wrapper for Card content.
 *
 * Adds focus ring + hover tint + Radix Slot polymorphism. Renders as
 * `<button type="button">` by default, or as the immediate child via
 * `asChild` (typical pattern: wrap a router `<Link>`).
 *
 * Bridge integration is local — CardActionArea is an action trigger
 * (not a surface), so it carries `access` + `visibleWhen` directly
 * (rather than relying on the wrapping Card's props). This lets the
 * consumer differentiate "the card is visible but not clickable" from
 * "the card is not visible at all".
 *
 * @example
 * ```tsx
 * // Card-as-CTA
 * <Card>
 *   <CardActionArea onClick={navigate}>
 *     <CardContent>
 *       <Typography variant="h3">Open dashboard</Typography>
 *       <Typography variant="body">Hover to see the focus ring.</Typography>
 *     </CardContent>
 *   </CardActionArea>
 * </Card>
 *
 * // Polymorphic — wrap a router Link
 * <Card>
 *   <CardActionArea asChild>
 *     <Link to="/billing">
 *       <CardContent>
 *         <Typography variant="h3">Billing</Typography>
 *       </CardContent>
 *     </Link>
 *   </CardActionArea>
 * </Card>
 *
 * // Selectable card (filter / option pattern)
 * <CardActionArea
 *   selected={selected === 'monthly'}
 *   onClick={() => setSelected('monthly')}
 * >
 *   <CardContent>Monthly plan</CardContent>
 * </CardActionArea>
 * ```
 */
export const CardActionArea = forwardRef<HTMLButtonElement, CardActionAreaProps>(
  function CardActionArea(props, ref) {
    const {
      children,
      asChild,
      selected,
      access,
      visibleWhen,
      disabled,
      sx,
      className,
      onClick,
      ...rest
    } = props;

    // Bridge — both hooks called unconditionally (rules-of-hooks).
    const bridge = useContext(DashFormContext);
    const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
    const accessState = useAccessState(access);

    if (!isVisible || !accessState.visible) return null;

    const isDisabled =
      Boolean(disabled) || accessState.disabled || accessState.readonly;

    // The action area must SPAN the parent Card so the entire surface
    // is clickable. Includes focus ring, hover, and a subtle pressed
    // tint via `data-pressed`. Token-driven via dashforgePreset.
    const classes = cn(
      'block w-full text-left',
      'outline-none rounded-[inherit]',
      'transition-colors',
      // Hover — gentle bg tint on top of the card surface. Uses
      // currentColor with 5% alpha so it composes with any Card
      // variant/color without hardcoding.
      'hover:bg-current/5',
      // Focus ring — keyboard-navigable, primary tone, inset slightly
      // so it traces the card's inherited radius.
      'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
      // Selected — adds a primary tone ring + soft tint so the card
      // visually reads as "active option" without changing the parent
      // Card's variant.
      selected && 'ring-2 ring-primary-500 ring-offset-1 bg-primary-50/60 dark:bg-primary-950/40',
      // Disabled — dims content and suppresses clicks.
      isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      sx,
      className
    );

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      if (isDisabled) return;
      onClick?.(e);
    };

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={classes}
          data-disabled={isDisabled || undefined}
          aria-disabled={isDisabled || undefined}
          aria-pressed={selected ? true : undefined}
          onClick={handleClick}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        className={classes}
        disabled={isDisabled}
        aria-pressed={selected ? true : undefined}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

CardActionArea.displayName = 'CardActionArea';
