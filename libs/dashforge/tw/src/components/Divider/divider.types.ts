import type { HTMLAttributes, ReactNode } from 'react';
import type { DividerVariants, DividerLineVariants } from './divider.variants.js';

/**
 * Props for `<Divider>` — visual separator with optional inline label.
 *
 * Two rendering modes:
 *   • Line-only (no `children`)   — renders an `<hr>` (horizontal) or
 *                                   `<div role="separator">` (vertical).
 *   • Labeled    (with `children`) — renders a flex row: two line
 *                                    segments around the centered label.
 *                                    Canonical "OR" separator pattern.
 *
 * The user passes ONE consistent prop set; the implementation chooses
 * the mode based on whether `children` is provided.
 */
export interface DividerProps
  extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'color' | 'children'>,
          Pick<DividerVariants, 'orientation' | 'align'>,
          Pick<DividerLineVariants, 'variant' | 'color'> {
  /**
   * Optional inline label. When present, the divider switches from
   * "single line" to "two segments + label" layout — the canonical
   * "OR" separator pattern between sign-in methods, section titled
   * separators, etc.
   *
   * Accepts any node (string, Typography element, Stack with icon,
   * etc.). Recommended: `<Typography variant="overline">OR</Typography>`
   * for short uppercase labels.
   */
  children?: ReactNode;

  /**
   * In a flex Stack `direction="row"`, a `<Divider orientation="vertical">`
   * with `flexItem` stretches to the row's cross-axis height (via
   * `self-stretch`). Without it, vertical dividers may collapse to
   * 0 height because there's nothing to anchor them.
   *
   * Implementation note: `self-stretch` is already applied on the
   * vertical line segment by default in the TV — this prop is a
   * no-op for now, kept for API parity with MUI's same flag (and as
   * a forward-compatibility hook if we ever change the default).
   */
  flexItem?: boolean;

  /**
   * Utility classes appended to the variant chain. Resolved via
   * `tailwind-merge`. Useful for one-off margin (`sx="my-8"`) or
   * a custom border weight (`sx="border-t-2"`).
   */
  sx?: string;
}
