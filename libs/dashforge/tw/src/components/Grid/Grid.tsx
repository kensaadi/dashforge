import { forwardRef, type ElementType, type ReactElement } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { gridVariants } from './grid.variants.js';
import type {
  GridProps,
  GridContainerProps,
  GridItemProps,
  ColSpan,
  GridSpacingStep,
} from './grid.types.js';

/**
 * `<Grid>` — CSS Grid container + item, polymorphic in role.
 *
 * API surface mirrors MUI Grid v2:
 *   • <Grid container spacing={4} cols={12}>          ← container
 *   • <Grid xs={12} md={6}>                           ← item
 *
 * Engine is REAL CSS Grid (not flexbox, unlike MUI v2 internals).
 * Benefits over flexbox-based implementation:
 *   • Native `gap` (no negative-margin tricks)
 *   • `col-span-N` maps directly to `grid-column: span N`
 *   • Vertical alignment without manual `align-items` per item
 *   • Auto-flow for dense packing without DOM gymnastics
 *
 * TypeScript discriminated union (see grid.types.ts) makes mixing
 * impossible: `<Grid container xs={6}>` won't compile. Same for the
 * inverse. IntelliSense filters by role.
 *
 * Defaults at the component level (not at the TV level — see the
 * variants file for the rationale):
 *   • container: cols defaults to 12 (MUI convention)
 *   • item:      xs defaults to 'full' so a forgotten prop doesn't
 *                collapse the cell to 1/12th of a row
 *
 * `asChild` on a CONTAINER is technically allowed but rarely useful:
 * `display:grid` only applies to direct children, so the slotted
 * element has to already be a viable container parent. Use sparingly;
 * test asserts the wrapping still emits the right class chain.
 */
export const Grid = forwardRef<HTMLElement, GridProps>(
  function Grid(_props, ref) {
    // Option C: theme defaults only apply to container-role axes
    // (cols, spacing, spacingX, spacingY, autoFlow). Item-role props
    // never overlap the theme keys so the merge is safe on both
    // branches of the discriminated union.
    const themeDefaults = useComponentDefaults('Grid');
    const props = { ...themeDefaults?.defaults, ..._props } as GridProps;
    const { as, asChild = false, sx, children, ...rest } = props as GridProps & {
      as?: ElementType;
      asChild?: boolean;
      sx?: string;
      children?: React.ReactNode;
    };
    /*
     * Discriminated union runtime branch.
     *
     * TS narrows GridProps to ONE of the two shapes (container or item)
     * at the call site, but inside this function body we receive the
     * union — so we manually narrow via a single cast per branch.
     * `as GridContainerProps` / `as GridItemProps` is sound because
     * `container === true` is the literal discriminator declared in
     * the types file; the cast just makes TS read the right branch.
     */
    const isContainer = (props as { container?: boolean }).container === true;

    let classes: string;
    let containerPayload: GridContainerProps | null = null;
    let itemPayload: GridItemProps | null = null;

    if (isContainer) {
      containerPayload = props as GridContainerProps;
      /*
       * Container branch — pass ONLY container axes to TV. Default cols
       * to 12 (MUI v2 convention) so a forgotten prop doesn't collapse
       * to grid-cols-1. The spacing axes are passed straight through;
       * TV silently drops undefined values.
       */
      classes = cn(
        gridVariants({
          container: true,
          cols:     (containerPayload.cols ?? 12) as 1 | 2 | 3 | 4 | 6 | 12,
          spacing:  containerPayload.spacing,
          spacingX: containerPayload.spacingX,
          spacingY: containerPayload.spacingY,
          autoFlow: containerPayload.autoFlow,
        }),
        sx,
      );
    } else {
      itemPayload = props as GridItemProps;
      /*
       * Item branch — default `xs` to 'full' so a forgotten breakpoint
       * prop doesn't collapse the cell to grid-auto's minimum width.
       */
      classes = cn(
        gridVariants({
          xs: (itemPayload.xs ?? 'full') as ColSpan,
          sm: itemPayload.sm,
          md: itemPayload.md,
          lg: itemPayload.lg,
          xl: itemPayload.xl,
        }),
        sx,
      );
    }

    /*
     * Strip role-specific props from `rest` before spreading on the DOM
     * element. Without this, React warns:
     *   "React does not recognize the `cols` prop on a DOM element"
     */
    const domRest: Record<string, unknown> = { ...(rest as Record<string, unknown>) };
    if (containerPayload) {
      delete domRest.cols;
      delete domRest.spacing;
      delete domRest.spacingX;
      delete domRest.spacingY;
      delete domRest.autoFlow;
    }
    if (itemPayload) {
      delete domRest.xs;
      delete domRest.sm;
      delete domRest.md;
      delete domRest.lg;
      delete domRest.xl;
    }
    // `container` discriminator itself must never reach the DOM.
    delete domRest.container;
    // Silence unused vars that the union typings require us to receive.
    void itemPayload; void containerPayload;
    // The unused-vars helper from grid.types is a type-only import,
    // referenced here to keep ESM tree-shake clean — TS handles imports.
    void ({} as GridSpacingStep);

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...domRest}>
          {children as ReactElement}
        </Slot>
      );
    }

    const Tag = (as ?? 'div') as ElementType;
    return (
      <Tag ref={ref as never} className={classes} {...domRest}>
        {children}
      </Tag>
    );
  },
);

Grid.displayName = 'Grid';
