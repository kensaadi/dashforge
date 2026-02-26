import { styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import type { ComponentType } from 'react';
import type { DrawerProps } from '@mui/material/Drawer';
import type { BoxProps } from '@mui/material/Box';
import type { ListItemButtonProps } from '@mui/material/ListItemButton';
import type { CollapseProps } from '@mui/material/Collapse';
import type { PaperProps } from '@mui/material/Paper';
import type { LeftNavSize } from './types';

/**
 * Width values for expanded and collapsed states.
 */
export const EXPANDED_WIDTH = 280;
export const COLLAPSED_WIDTH = 64;

/**
 * Height values for different size variants.
 */
const SIZE_HEIGHT_MAP: Record<LeftNavSize, number> = {
  sm: 40,
  md: 48,
  lg: 56,
};

/**
 * Props for StyledDrawer.
 */
interface StyledDrawerProps {
  isOpen: boolean;
  isMobile: boolean;
  mobileVariant: string;
  expandedWidth: number;
  collapsedWidth: number;
}

/**
 * Root drawer component with width transition.
 */
export const StyledDrawer: ComponentType<DrawerProps & StyledDrawerProps> =
  styled(Drawer, {
    shouldForwardProp: (prop) =>
      prop !== 'isOpen' &&
      prop !== 'isMobile' &&
      prop !== 'mobileVariant' &&
      prop !== 'expandedWidth' &&
      prop !== 'collapsedWidth',
  })<StyledDrawerProps>(
    ({
      theme,
      isOpen,
      isMobile,
      mobileVariant,
      expandedWidth,
      collapsedWidth,
    }) => {
      const variant =
        isMobile && mobileVariant === 'temporary' ? 'temporary' : 'permanent';

      return {
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(variant === 'permanent' && {
          width: isOpen ? expandedWidth : collapsedWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: isOpen
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen,
          }),
          '& .MuiDrawer-paper': {
            width: isOpen ? expandedWidth : collapsedWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: isOpen
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
          },
        }),
        ...(variant === 'temporary' && {
          '& .MuiDrawer-paper': {
            width: expandedWidth,
          },
        }),
      };
    }
  );

/**
 * Container for navigation content.
 */
export const NavContainer: ComponentType<BoxProps> = styled(Box)(
  ({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.vars
      ? theme.vars.palette.background.paper
      : theme.palette.background.paper,
  })
);

/**
 * Scrollable content area.
 */
export const NavContent: ComponentType<BoxProps> = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
});

/**
 * Props for NavItemButton.
 */
interface NavItemButtonProps {
  size: LeftNavSize;
  isActive: boolean;
  isNested?: boolean;
}

/**
 * Navigation item button with size variants and active state.
 */
export const NavItemButton: ComponentType<
  ListItemButtonProps & NavItemButtonProps
> = styled(ListItemButton, {
  shouldForwardProp: (prop) =>
    prop !== 'size' && prop !== 'isActive' && prop !== 'isNested',
})<NavItemButtonProps>(({ theme, size, isActive, isNested }) => {
  const height = SIZE_HEIGHT_MAP[size];

  return {
    height,
    minHeight: height,
    paddingLeft: isNested ? theme.spacing(4) : theme.spacing(2),
    paddingRight: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    ...(isActive && {
      backgroundColor: alpha(
        theme.vars?.palette?.primary?.main ?? theme.palette.primary.main,
        0.12
      ),
      color: theme.vars?.palette?.primary?.main ?? theme.palette.primary.main,
      fontWeight: theme.typography.fontWeightMedium,
      '&:hover': {
        backgroundColor: alpha(
          theme.vars?.palette?.primary?.main ?? theme.palette.primary.main,
          0.16
        ),
      },
    }),
  };
});

/**
 * Styled MUI Collapse for inline expand/collapse.
 */
export const StyledCollapse: ComponentType<CollapseProps> = styled(Collapse)({
  '& .MuiCollapse-wrapperInner': {
    paddingLeft: 0,
  },
});

/**
 * Props for FlyoutPaper.
 */
interface FlyoutPaperProps {
  size: LeftNavSize;
}

/**
 * Flyout paper for collapsed mode.
 */
export const FlyoutPaper: ComponentType<PaperProps & FlyoutPaperProps> = styled(
  Paper,
  {
    shouldForwardProp: (prop) => prop !== 'size',
  }
)<FlyoutPaperProps>(({ theme, size }) => {
  const height = SIZE_HEIGHT_MAP[size];

  return {
    minWidth: 200,
    maxWidth: 280,
    padding: theme.spacing(1),
    '& .MuiListItemButton-root': {
      height,
      minHeight: height,
      borderRadius: theme.spacing(1),
      marginBottom: theme.spacing(0.5),
    },
  };
});

/**
 * Icon container with consistent sizing.
 */
export const IconContainer: ComponentType<BoxProps> = styled(Box)(
  ({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    marginRight: theme.spacing(1.5),
    color: 'inherit',
  })
);

/**
 * Label container with text overflow handling.
 */
export const LabelContainer: ComponentType<BoxProps> = styled(Box)({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/**
 * Badge container.
 */
export const BadgeContainer: ComponentType<BoxProps> = styled(Box)(
  ({ theme }) => ({
    marginLeft: theme.spacing(1),
  })
);

/**
 * Divider between items.
 */
export const ItemDivider: ComponentType<BoxProps> = styled(Box)(
  ({ theme }) => ({
    height: 1,
    backgroundColor: theme.vars
      ? theme.vars.palette.divider
      : theme.palette.divider,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  })
);

/**
 * Toggle button container.
 */
export const ToggleButtonContainer: ComponentType<BoxProps> = styled(Box)(
  ({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(1),
  })
);
