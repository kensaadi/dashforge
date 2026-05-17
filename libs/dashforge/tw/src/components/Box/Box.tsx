import { forwardRef, type ElementType, type ReactElement } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn.js';
import { boxVariants } from './box.variants.js';
import type { BoxProps } from './box.types.js';

/**
 * `<Box>` — the surface primitive of @dashforge/tw.
 *
 * What it IS:
 *   A polymorphic container with typed surface variants (plain /
 *   outlined / elevated / soft / solid) × 7 intent colours, plus
 *   spacing / sizing / rounded / elevation as enumerated token-scale
 *   props. Replaces MUI's Box + Paper + Card + Surface in one component.
 *
 * What it is NOT (deliberate, enforced by the prop set):
 *   • Not a flex container         → use <Stack>
 *   • Not a grid container         → use <Grid>
 *   • Not a paragraph              → use <Typography>
 *   • Not a button                 → use <Button>
 *
 * The "Box is not flex" rule is the spine of the layout layer. Without
 * it, every `<div>` in an app gravitates back to Box and the surface
 * vs layout distinction collapses. Box's job is the SURFACE around
 * content; Stack/Grid's job is the ARRANGEMENT of content. Two
 * primitives, two responsibilities.
 *
 * When BOTH `as` and `asChild` are passed, `asChild` wins. Same rule
 * as Typography — documented to avoid the dimension-bloat of a
 * discriminated union over an 11-axis props type.
 *
 * Layering:
 *   • Sits BENEATH every visual chrome — every card, every panel,
 *     every section background.
 *   • Composes ON TOP of @dashforge/tw-tokens (color + spacing + radius
 *     + shadow scales) via the dashforgePreset CSS variables.
 *   • Pairs with Typography for text content, Stack/Grid for layout
 *     children inside it.
 */
export const Box = forwardRef<HTMLElement, BoxProps>(
  function Box(props, ref) {
    const {
      variant,
      color,
      elevation,
      rounded,
      p, px, py, m, mx, my,
      fullWidth,
      fullHeight,
      as,
      asChild = false,
      sx,
      children,
      ...rest
    } = props;

    const classes = cn(
      boxVariants({
        variant, color, elevation, rounded,
        p, px, py, m, mx, my,
        fullWidth, fullHeight,
      }),
      sx,
    );

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...rest}>
          {children as ReactElement}
        </Slot>
      );
    }

    const Tag = (as ?? 'div') as ElementType;
    return (
      <Tag ref={ref as never} className={classes} {...rest}>
        {children}
      </Tag>
    );
  },
);

Box.displayName = 'Box';
