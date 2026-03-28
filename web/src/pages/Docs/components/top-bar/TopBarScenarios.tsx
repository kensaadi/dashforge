import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { TopBarLayoutDemo } from './demos/TopBarLayoutDemo';
import { TopBarResponsiveDemo } from './demos/TopBarResponsiveDemo';

/**
 * TopBarScenarios displays realistic layout composition scenarios
 * Shows application shell integration and responsive behavior
 */
export function TopBarScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={6}>
      {/* Scenario 1: Dashboard Shell */}
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: 22, md: 28 },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 1,
            }}
          >
            Dashboard Application Shell
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
              mb: 2,
            }}
          >
            Combine TopBar with LeftNav to create a complete dashboard layout.
            The TopBar automatically adjusts its position and width when the
            navigation toggles or collapses.
          </Typography>
        </Box>

        <DocsPreviewBlock
          code={`import { TopBar, LeftNav } from '@dashforge/ui';
import { useState } from 'react';

const [navOpen, setNavOpen] = useState(true);

<Box sx={{ display: 'flex', minHeight: '100vh' }}>
  <LeftNav
    open={navOpen}
    widthExpanded={280}
    widthCollapsed={64}
    onToggle={() => setNavOpen(!navOpen)}
  >
    {/* Navigation items */}
  </LeftNav>
  
  <Box sx={{ flexGrow: 1 }}>
    <TopBar
      navOpen={navOpen}
      navWidthExpanded={280}
      navWidthCollapsed={64}
      left={
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={() => setNavOpen(!navOpen)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Dashboard</Typography>
        </Stack>
      }
      right={
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton>
            <NotificationsIcon />
          </IconButton>
          <Avatar />
        </Stack>
      }
    />
    
    <Box component="main" sx={{ p: 3, mt: 10 }}>
      {/* Page content */}
    </Box>
  </Box>
</Box>`}
          badge="Interactive Demo"
        >
          <TopBarLayoutDemo />
        </DocsPreviewBlock>

        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.15)'
              : '1px solid rgba(59,130,246,0.12)',
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: isDark ? '#60a5fa' : '#2563eb',
              mb: 1,
            }}
          >
            Why it matters
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            TopBar's coordination with LeftNav eliminates manual layout
            calculations. The header automatically shifts and resizes when
            navigation state changes, with smooth transitions for a polished UX.
          </Typography>
        </Box>
      </Stack>

      {/* Scenario 2: Responsive Mobile Behavior */}
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: 22, md: 28 },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 1,
            }}
          >
            Responsive Mobile Adaptation
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
              mb: 2,
            }}
          >
            TopBar automatically adapts to mobile viewports. Below the
            breakpoint threshold, it spans full width and ignores navigation
            state for optimal mobile UX.
          </Typography>
        </Box>

        <DocsPreviewBlock
          code={`import { TopBar } from '@dashforge/ui';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

<TopBar
  navOpen={navOpen}
  navWidthExpanded={280}
  navWidthCollapsed={64}
  breakpoint="lg"
  left={
    <Stack direction="row" spacing={2} alignItems="center">
      {isMobile && (
        <IconButton onClick={() => setMobileMenuOpen(true)}>
          <MenuIcon />
        </IconButton>
      )}
      <Typography variant="h6">
        {isMobile ? 'App' : 'Application Name'}
      </Typography>
    </Stack>
  }
  center={!isMobile && <SearchBar />}
  right={
    <Stack direction="row" spacing={1}>
      {!isMobile && (
        <IconButton>
          <NotificationsIcon />
        </IconButton>
      )}
      <Avatar />
    </Stack>
  }
/>`}
          badge="Interactive Demo"
        >
          <TopBarResponsiveDemo />
        </DocsPreviewBlock>

        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.15)'
              : '1px solid rgba(59,130,246,0.12)',
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: isDark ? '#60a5fa' : '#2563eb',
              mb: 1,
            }}
          >
            Why it matters
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Mobile-first design requires different header layouts. TopBar's
            automatic viewport adaptation lets you compose conditional content
            while the component handles layout geometry automatically.
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
