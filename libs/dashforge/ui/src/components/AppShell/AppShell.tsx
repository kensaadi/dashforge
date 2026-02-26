import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { LeftNav } from '../LeftNav';
import { TopBar } from '../TopBar';
import type { AppShellProps } from './types';

/**
 * AppShell component that composes LeftNav, TopBar, and main content area.
 *
 * Features:
 * - Responsive layout coordination (desktop/mobile)
 * - Controlled/uncontrolled nav state
 * - Automatic toolbar spacing for fixed TopBar
 * - Main content offset matches LeftNav width
 *
 * @example
 * ```tsx
 * <AppShell
 *   items={navItems}
 *   renderLink={renderLink}
 *   isActive={isActive}
 *   topBarLeft={<Logo />}
 *   topBarRight={<UserMenu />}
 * >
 *   <YourMainContent />
 * </AppShell>
 * ```
 */
export function AppShell({
  items,
  renderLink,
  isActive,
  navOpen: controlledNavOpen,
  defaultNavOpen = true,
  onNavOpenChange,
  navWidthExpanded = 280,
  navWidthCollapsed = 64,
  breakpoint = 'lg',
  topBarLeft,
  topBarCenter,
  topBarRight,
  topBarPosition = 'fixed',
  toolbarMinHeight = { xs: 68, md: 76 },
  leftNavHeader,
  leftNavFooter,
  children,
  mainSx,
  'data-testid': dataTestId,
}: AppShellProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(breakpoint));

  // Controlled/uncontrolled state for nav
  const [uncontrolledNavOpen, setUncontrolledNavOpen] =
    useState(defaultNavOpen);
  const isControlled = controlledNavOpen !== undefined;
  const navOpen = isControlled ? controlledNavOpen : uncontrolledNavOpen;

  const handleNavOpenChange = (open: boolean) => {
    if (!isControlled) {
      setUncontrolledNavOpen(open);
    }
    onNavOpenChange?.(open);
  };

  // Compute main offset based on mobile/desktop and nav state
  const isDesktop = !isMobile;
  const mainOffset = isDesktop
    ? navOpen
      ? navWidthExpanded
      : navWidthCollapsed
    : 0;

  // Determine if we need a toolbar spacer
  const needsToolbarSpacer = topBarPosition === 'fixed';

  return (
    <Box
      data-testid={dataTestId}
      sx={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      {/* LeftNav */}
      <LeftNav
        items={items}
        renderLink={renderLink}
        isActive={isActive}
        open={navOpen}
        onOpenChange={handleNavOpenChange}
        widthExpanded={navWidthExpanded}
        widthCollapsed={navWidthCollapsed}
        mobileBreakpoint={breakpoint}
        header={leftNavHeader}
        footer={leftNavFooter}
      />

      {/* TopBar */}
      <TopBar
        navOpen={navOpen}
        navWidthExpanded={navWidthExpanded}
        navWidthCollapsed={navWidthCollapsed}
        breakpoint={breakpoint}
        position={topBarPosition}
        left={topBarLeft}
        center={topBarCenter}
        right={topBarRight}
        toolbarMinHeight={toolbarMinHeight}
      />

      {/* Main content area */}
      <Box
        component="main"
        data-dash-main-offset={mainOffset}
        data-dash-main-margin-left={mainOffset}
        sx={{
          flexGrow: 1,
          marginLeft: isDesktop ? `${mainOffset}px` : 0,
          width: isDesktop ? `calc(100% - ${mainOffset}px)` : '100%',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...mainSx,
        }}
      >
        {/* Toolbar spacer for fixed TopBar */}
        {needsToolbarSpacer && (
          <Toolbar
            data-testid="toolbar-spacer"
            data-dash-toolbar-spacer="true"
            sx={{ minHeight: toolbarMinHeight }}
          />
        )}

        {/* User content */}
        {children}
      </Box>
    </Box>
  );
}
