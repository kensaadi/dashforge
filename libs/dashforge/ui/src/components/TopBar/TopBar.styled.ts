import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import type { ComponentType } from 'react';
import type { AppBarProps } from '@mui/material/AppBar';

/**
 * Props for StyledAppBar.
 */
interface StyledAppBarProps {
  /** Left offset in pixels (for desktop coordination with LeftNav) */
  dashOffsetPx: number;
  /** Width CSS value (e.g., 'calc(100% - 280px)' or '100%') */
  dashWidthCss: string;
  /** Whether currently in desktop mode */
  isDesktop: boolean;
}

/**
 * Styled AppBar that coordinates with LeftNav.
 *
 * Desktop behavior:
 * - Shifts right based on LeftNav state (marginLeft + width adjustment)
 *
 * Mobile behavior:
 * - Always 100% width, no left margin
 */
export const StyledAppBar: ComponentType<AppBarProps & StyledAppBarProps> =
  styled(AppBar, {
    shouldForwardProp: (prop) =>
      prop !== 'dashOffsetPx' &&
      prop !== 'dashWidthCss' &&
      prop !== 'isDesktop',
  })<StyledAppBarProps>(({ theme, dashOffsetPx, dashWidthCss, isDesktop }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    borderBottom: `1px solid ${
      theme.vars?.palette?.grey?.[300] ?? theme.palette.grey[300]
    }`,
    ...(isDesktop
      ? {
          marginLeft: dashOffsetPx,
          width: dashWidthCss,
        }
      : {
          marginLeft: 0,
          width: '100%',
        }),
  }));
