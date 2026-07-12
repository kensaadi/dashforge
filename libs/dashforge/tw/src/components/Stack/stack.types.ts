import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import type { StackVariants } from './stack.variants.js';

/**
 * Subset of `<Stack>` props theme-configurable via
 * `theme.components.Stack.defaults` (Option C).
 */
export type StackVariantProps = Pick<
  StackVariants,
  'direction' | 'align' | 'justify' | 'gap' | 'wrap' | 'fullWidth' | 'fullHeight'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Stack?: {
      defaults?: Partial<StackVariantProps>;
    };
  }
}

/**
 * Props for `<Stack>` — flex container 1D, the layout primitive.
 *
 * Axes:
 *   • direction              — flex-direction (default 'col')
 *   • align                  — items-* (cross-axis)
 *   • justify                — justify-* (main-axis)
 *   • gap                    — token-scale spacing step
 *   • wrap                   — flex-wrap
 *   • fullWidth/fullHeight   — w-full / h-full
 *   • divider                — node rendered N-1 times between children
 *
 * Polymorphism:
 *   • as            — override the HTML tag (default 'div')
 *   • asChild       — render via Radix Slot onto the single child
 *
 * What Stack does NOT do (route to other primitives):
 *   • Surface chrome (border, bg, shadow)   → wrap in <Box>
 *   • 2D layout (rows AND columns)          → use <Grid>
 *   • Text styling                          → <Typography>
 */
export interface StackProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /**
   * Flex direction.
   * @default 'col'
   */
  direction?: StackVariants['direction'];

  /** Cross-axis alignment (`items-*`). */
  align?: StackVariants['align'];

  /** Main-axis alignment (`justify-*`). */
  justify?: StackVariants['justify'];

  /** Gap between children — spacing token step. */
  gap?: StackVariants['gap'];

  /**
   * Allow children to wrap to the next line (`flex-wrap`).
   * @default false
   */
  wrap?: StackVariants['wrap'];

  /**
   * Stretch to fill the container's width.
   * @default false
   */
  fullWidth?: StackVariants['fullWidth'];

  /**
   * Stretch to fill the container's height.
   * @default false
   */
  fullHeight?: StackVariants['fullHeight'];

  /**
   * Node rendered N-1 times BETWEEN children — mirror of MUI Stack's
   * divider prop. Useful for visual separators (a `<hr>`, a thin
   * `<Box variant="outlined" sx="h-px border-0 border-t">`, an
   * `<svg>` glyph) that need to follow the flex direction.
   *
   * The node is cloned for each insertion via `cloneElement`; pass a
   * stable element (not a function) for best React reconciliation.
   * `React.Children.toArray` flattens fragments before the walk, so
   * `<Stack divider={...}><><...></></Stack>` works as expected.
   */
  divider?: ReactNode;

  /**
   * Override the rendered HTML tag. Defaults to `'div'`. Use when the
   * Stack also has semantic meaning — `<Stack as="nav">` for a nav
   * bar, `<Stack as="ul">` for a list (children become `<li>` via
   * native HTML, not by us).
   *
   * Ignored when `asChild` is true.
   */
  as?: ElementType;

  /**
   * Render via Radix `Slot` — the Stack styles paint onto the single
   * React child instead of wrapping it. Mutually exclusive with `as`
   * (when both are passed, `asChild` wins). The `divider` prop is
   * ignored when `asChild` is true (the Slot pattern wraps a single
   * node, so the N-1 insertion logic has no place to act).
   */
  asChild?: boolean;

  /**
   * Utility classes appended to the variant chain. Resolved via
   * `tailwind-merge` so the consumer's classes always win over the
   * variant defaults.
   */
  sx?: string;
}
