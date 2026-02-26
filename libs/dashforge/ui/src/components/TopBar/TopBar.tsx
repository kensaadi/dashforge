import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import type { TopBarProps } from './types';
import { StyledAppBar } from './TopBar.styled';

/**
 * TopBar component that coordinates with LeftNav.
 *
 * Features:
 * - Desktop: Shifts right based on LeftNav state (navOpen + widths)
 * - Mobile: Always 100% width (ignores nav state)
 * - Smooth transitions when nav toggles
 * - Three content slots: left, center, right
 *
 * @example
 * ```tsx
 * <TopBar
 *   navOpen={navOpen}
 *   navWidthExpanded={280}
 *   navWidthCollapsed={64}
 *   left={<Typography>Logo</Typography>}
 *   right={<Avatar />}
 * />
 * ```
 */
export function TopBar({
  navOpen,
  navWidthExpanded,
  navWidthCollapsed,
  breakpoint = 'lg',
  position = 'fixed',
  left,
  center,
  right,
  toolbarMinHeight = { xs: 68, md: 76 },
  ...appBarProps
}: TopBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(breakpoint));

  // Compute offset and width based on mobile/desktop and nav state
  const isDesktop = !isMobile;
  const offset = isDesktop
    ? navOpen
      ? navWidthExpanded
      : navWidthCollapsed
    : 0;
  const widthCss = isDesktop ? `calc(100% - ${offset}px)` : '100%';

  return (
    <StyledAppBar
      position={position}
      dashOffsetPx={offset}
      dashWidthCss={widthCss}
      isDesktop={isDesktop}
      data-dash-position={position}
      data-dash-offset={offset}
      data-dash-width={widthCss}
      data-dash-has-transition="true"
      {...appBarProps}
    >
      <Toolbar
        data-testid="top-bar-toolbar"
        data-dash-toolbar="true"
        sx={{
          minHeight: toolbarMinHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {/* Left slot */}
        {left && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>{left}</Box>
        )}

        {/* Center slot */}
        {center && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {center}
          </Box>
        )}

        {/* Right slot */}
        {right && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            {right}
          </Box>
        )}
      </Toolbar>
    </StyledAppBar>
  );
}
