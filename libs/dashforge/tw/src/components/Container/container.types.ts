import type { ElementType, HTMLAttributes } from 'react';
import type { ContainerVariants } from './container.variants.js';

/**
 * Subset of `<Container>` props theme-configurable via
 * `theme.components.Container.defaults` (Option C).
 */
export type ContainerVariantProps = Pick<
  ContainerVariants,
  'size' | 'px' | 'centerContent'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Container?: {
      defaults?: Partial<ContainerVariantProps>;
    };
  }
}

/**
 * Props for `<Container>` — page-level centered max-width wrapper.
 *
 * Use at the page-root level (or section-root) to constrain content
 * width and apply the canonical responsive horizontal padding ramp.
 * Compose Stack/Grid INSIDE Container for the actual layout work.
 *
 * Native attribute overrides:
 *   • `className` omitted in favour of `sx` (utility string, merged
 *     via tailwind-merge — same convention as Box/Stack/Grid/Typography).
 */
export interface ContainerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /**
   * Max-width tier. `'fluid'` disables the cap and keeps `w-full`.
   * @default 'xl'
   */
  size?: ContainerVariants['size'];

  /**
   * Responsive horizontal padding ramp (`px-4 sm:px-6 lg:px-8`).
   * Set to `false` to opt out (rare — usually you want the ramp).
   * @default true
   */
  px?: ContainerVariants['px'];

  /**
   * Center children as a flex column (`mx-auto` + `flex flex-col items-center`).
   * @default false
   */
  centerContent?: ContainerVariants['centerContent'];

  /**
   * Override the rendered HTML tag. Defaults to `'div'`. Use
   * `as="main"` for the primary content region of a page,
   * `as="section"` for a named section, `as="article"` for a
   * self-contained article shell.
   *
   * Ignored when `asChild` is true.
   */
  as?: ElementType;

  /**
   * Render via Radix `Slot` — the Container styles paint onto the
   * single React child instead of wrapping it. Useful for letting a
   * router `<main>` element receive the Container chrome without
   * adding an intermediate `<div>` in the tree.
   *
   * Mutually exclusive with `as` (when both are passed, `asChild` wins).
   */
  asChild?: boolean;

  /**
   * Utility classes appended to the variant chain. Resolved via
   * `tailwind-merge` so the consumer's classes always win over the
   * variant defaults — useful for one-off vertical padding (`sx="py-8"`),
   * custom max-width (`sx="max-w-3xl"`), etc.
   */
  sx?: string;
}
