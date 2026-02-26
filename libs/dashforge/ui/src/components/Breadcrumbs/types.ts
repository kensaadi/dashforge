import type React from 'react';

export type BreadcrumbMatch = 'exact' | 'prefix';

export interface BreadcrumbNode {
  /** Stable id for rendering + tracking */
  id: string;

  /**
   * Display label.
   * - If string: usually a translation key handled via getLabel() in the component.
   * - If ReactNode: rendered as-is.
   */
  label: string | React.ReactNode;

  /** Navigation target. If omitted, node is treated as a non-clickable container. */
  href?: string;

  /** How this node matches the current pathname (defaults to 'prefix'). */
  match?: BreadcrumbMatch;

  /** When true, the crumb is rendered as text even if href is present. */
  disabled?: boolean;

  /** Optional nested items */
  children?: BreadcrumbNode[];

  /** App-defined metadata */
  meta?: unknown;
}
