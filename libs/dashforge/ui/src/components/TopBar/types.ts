import type { ReactNode } from 'react';
import type { AppBarProps } from '@mui/material/AppBar';

/**
 * Props for the TopBar component.
 *
 * TopBar is designed to work seamlessly with LeftNav:
 * - On desktop (>= breakpoint), it shifts right based on LeftNav state
 * - On mobile (< breakpoint), it spans full width (ignores nav state)
 */
export interface TopBarProps extends Omit<AppBarProps, 'position'> {
  /**
   * Whether the LeftNav is open/expanded.
   * Required for layout coordination.
   */
  navOpen: boolean;

  /**
   * Width in pixels of LeftNav when expanded.
   * Used to compute desktop margin/width.
   * @example 280
   */
  navWidthExpanded: number;

  /**
   * Width in pixels of LeftNav when collapsed.
   * Used to compute desktop margin/width.
   * @example 64
   */
  navWidthCollapsed: number;

  /**
   * Breakpoint below which mobile behavior is triggered.
   * On mobile, TopBar ignores nav state and spans full width.
   * @default 'lg'
   */
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * AppBar position.
   * @default 'fixed'
   */
  position?: AppBarProps['position'];

  /**
   * Optional left-aligned content slot.
   */
  left?: ReactNode;

  /**
   * Optional center-aligned content slot.
   */
  center?: ReactNode;

  /**
   * Optional right-aligned content slot.
   */
  right?: ReactNode;

  /**
   * Toolbar minimum height (responsive).
   * @default { xs: 68, md: 76 }
   */
  toolbarMinHeight?: { xs: number; md: number };
}
