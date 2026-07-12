import { forwardRef, useContext, type ElementType, type ReactElement } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
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
    // Option C precedence chain:
    //   TV `defaultVariants` < theme override < instance prop < sx
    // Spread order (`{ ...theme.defaults, ...props }`) enforces
    // theme < instance; `sx` layers last via `cn()` + tailwind-merge.
    const themeDefaults = useComponentDefaults('Box');
    const merged: BoxProps = { ...themeDefaults?.defaults, ...props };
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
      visibleWhen,
      access,
      children,
      ...rest
    } = merged;

    // Bridge — hooks called unconditionally (rules-of-hooks).
    // `useEngineVisibility` subscribes to engine state inside a
    // `<DashForm>` and re-evaluates the predicate reactively; outside
    // a form, it evaluates the predicate as a plain closure.
    // `useAccessState` consults the @dashforge/rbac policy engine.
    // Both default to no-op when the corresponding prop is omitted.
    const bridge = useContext(DashFormContext);
    const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
    const accessState = useAccessState(access);

    // Early return — predicate false OR RBAC denies visibility.
    if (!isVisible || !accessState.visible) return null;

    const classes = cn(
      boxVariants({
        variant, color, elevation, rounded,
        p, px, py, m, mx, my,
        fullWidth, fullHeight,
      }),
      // RBAC-disabled / readonly surfaces dim visually + carry
      // semantic ARIA attributes (assigned below) so descendants and
      // assistive tech can react.
      accessState.disabled && 'opacity-60',
      accessState.readonly && 'opacity-80',
      sx,
    );

    const ariaProps = {
      'aria-disabled': accessState.disabled || undefined,
      'aria-readonly': accessState.readonly || undefined,
      'data-disabled': accessState.disabled || undefined,
      'data-readonly': accessState.readonly || undefined,
    };

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...ariaProps} {...rest}>
          {children as ReactElement}
        </Slot>
      );
    }

    const Tag = (as ?? 'div') as ElementType;
    return (
      <Tag ref={ref as never} className={classes} {...ariaProps} {...rest}>
        {children}
      </Tag>
    );
  },
);

Box.displayName = 'Box';
