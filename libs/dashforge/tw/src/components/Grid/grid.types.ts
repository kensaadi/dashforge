import type { ElementType, HTMLAttributes } from 'react';

/**
 * Grid types — discriminated union for container vs item role.
 *
 * Pattern is MUI v2: a single `<Grid>` component that switches role
 * based on the `container` prop. Container exposes layout axes
 * (cols, spacing, autoFlow). Item exposes per-breakpoint span axes
 * (xs/sm/md/lg/xl).
 *
 * TypeScript-level enforcement (the key win over MUI):
 *   • `<Grid container xs={6}>` is a TYPE ERROR — `xs` doesn't exist
 *     on the container shape.
 *   • `<Grid xs={6} spacing={4}>` is a TYPE ERROR — `spacing` doesn't
 *     exist on the item shape.
 *   IntelliSense filters suggestions per role, so the developer never
 *   sees props that don't apply.
 *
 * Type-only file (no runtime). Lives separate from the variants so the
 * union doesn't widen with the variant catalogue's enum unions.
 */

/**
 * Valid column-span values for a grid item, at any breakpoint.
 *   • 1..12  — explicit span count
 *   • 'auto' — content-sized (CSS Grid auto-track)
 *   • 'full' — `col-span-full` (spans all columns regardless of count)
 */
export type ColSpan =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  | 'auto'
  | 'full';

/**
 * Token-scale spacing step. Mirror of Box.p / Stack.gap so the value
 * space across primitives is identical — `<Grid container spacing={4}>`
 * and `<Stack gap={4}>` produce visually equivalent gaps.
 */
export type GridSpacingStep =
  | 0 | '0.5' | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16 | 24;

/**
 * Container-role props. Discriminated on `container: true`.
 *
 * NOTE on `cols`: defaults to 12 in the component implementation
 * (not in TV) — the MUI v2 convention. Override to 6/4/3/2/1 for
 * dense dashboard layouts.
 */
export interface GridContainerProps {
  /** Discriminator — `true` makes this a grid container. */
  container: true;
  /** Number of columns. Default 12. */
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  /** Gap between cells. Shorthand for spacingX + spacingY. */
  spacing?: GridSpacingStep;
  /** Horizontal gap override (wins over `spacing`). */
  spacingX?: GridSpacingStep;
  /** Vertical gap override (wins over `spacing`). */
  spacingY?: GridSpacingStep;
  /** `grid-auto-flow` — useful for dense or column-major packing. */
  autoFlow?: 'row' | 'col' | 'dense' | 'row-dense' | 'col-dense';
}

/**
 * Item-role props. Discriminated on `container: false | undefined`.
 *
 * Each breakpoint accepts a `ColSpan`. The cascade is Tailwind-native
 * mobile-first: `xs` is the base (no media query), `sm/md/lg/xl`
 * override at the corresponding min-width.
 *
 * Default behaviour when no breakpoint is set: spans `full` — the
 * "comfortable default" so a forgotten prop doesn't collapse the cell
 * to 1/12th of a row.
 */
export interface GridItemProps {
  /** Discriminator — absent (or `false`) makes this a grid item. */
  container?: false;
  /** Base breakpoint (no media query). Default `'full'`. */
  xs?: ColSpan;
  /** Span at sm breakpoint and up. */
  sm?: ColSpan;
  /** Span at md breakpoint and up. */
  md?: ColSpan;
  /** Span at lg breakpoint and up. */
  lg?: ColSpan;
  /** Span at xl breakpoint and up. */
  xl?: ColSpan;
}

/**
 * Common props shared by both roles. Kept in a separate intersection
 * so the discriminated union stays narrow and IntelliSense fast.
 */
interface GridCommonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Override the rendered HTML tag. Default `'div'`. Ignored under `asChild`. */
  as?: ElementType;
  /**
   * Render via Radix Slot onto the single child. Wins over `as`.
   * Note: container Grids using `asChild` don't make sense for most
   * cases — the Slot pattern collapses our wrapper, but Grid's
   * `display:grid` only applies to direct children, so the child
   * needs to BE a container with the right children.
   */
  asChild?: boolean;
  /** Utility-class override, merged via tailwind-merge. */
  sx?: string;
}

/**
 * `<Grid>` props — discriminated union: container OR item, never both.
 */
export type GridProps = (GridContainerProps | GridItemProps) & GridCommonProps;
