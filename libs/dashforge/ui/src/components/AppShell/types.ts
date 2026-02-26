import type { ReactNode } from 'react';
import type { AppBarProps } from '@mui/material/AppBar';
import type { SxProps, Theme } from '@mui/material/styles';
import type { LeftNavItem, RenderLinkFn, IsActiveFn } from '../LeftNav/types';

/**
 * Props for the AppShell component.
 *
 * AppShell is a composition component that wires together:
 * - LeftNav (side navigation)
 * - TopBar (header)
 * - Main content area (children)
 *
 * It handles:
 * - Responsive layout coordination (desktop/mobile)
 * - Controlled/uncontrolled nav state
 * - Toolbar spacing for fixed TopBar
 */
export interface AppShellProps {
  /**
   * Navigation items for LeftNav.
   */
  items: LeftNavItem[];

  /**
   * Router-agnostic link renderer for LeftNav.
   * If not provided, items are rendered as non-interactive text.
   */
  renderLink?: RenderLinkFn;

  /**
   * Callback to determine if an item is active (for LeftNav).
   */
  isActive?: IsActiveFn;

  /**
   * Controlled drawer open state.
   * When provided, component operates in controlled mode.
   */
  navOpen?: boolean;

  /**
   * Default drawer open state for uncontrolled mode.
   * @default true
   */
  defaultNavOpen?: boolean;

  /**
   * Callback when drawer open state changes.
   */
  onNavOpenChange?: (open: boolean) => void;

  /**
   * Width in pixels when LeftNav is expanded.
   * @default 280
   */
  navWidthExpanded?: number;

  /**
   * Width in pixels when LeftNav is collapsed.
   * @default 64
   */
  navWidthCollapsed?: number;

  /**
   * Breakpoint below which mobile behavior is triggered.
   * @default 'lg'
   */
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Optional left-aligned content slot for TopBar.
   */
  topBarLeft?: ReactNode;

  /**
   * Optional center-aligned content slot for TopBar.
   */
  topBarCenter?: ReactNode;

  /**
   * Optional right-aligned content slot for TopBar.
   */
  topBarRight?: ReactNode;

  /**
   * TopBar position.
   * When 'fixed', a toolbar spacer is added to push main content down.
   * @default 'fixed'
   */
  topBarPosition?: AppBarProps['position'];

  /**
   * Toolbar minimum height (responsive) for TopBar.
   * @default { xs: 68, md: 76 }
   */
  toolbarMinHeight?: { xs: number; md: number };

  /**
   * Optional header slot for LeftNav.
   */
  leftNavHeader?: ReactNode;

  /**
   * Optional footer slot for LeftNav.
   */
  leftNavFooter?: ReactNode;

  /**
   * Main content to render inside the shell.
   */
  children: ReactNode;

  /**
   * Optional sx props for main container.
   */
  mainSx?: SxProps<Theme>;

  /**
   * Optional test ID for the root element.
   */
  'data-testid'?: string;
}
