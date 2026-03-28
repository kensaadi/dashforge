import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { TopBar } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { useState } from 'react';

/**
 * TopBarResponsiveDemo demonstrates responsive mobile adaptation
 */
export function TopBarResponsiveDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>(
    'desktop'
  );
  const [navOpen, setNavOpen] = useState(true);

  const isMobile = viewportMode === 'mobile';

  return (
    <Stack spacing={3}>
      {/* Demo Controls */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(15,23,42,0.08)',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Viewport Mode:
          </Typography>
          <Button
            size="small"
            variant={viewportMode === 'desktop' ? 'contained' : 'outlined'}
            onClick={() => setViewportMode('desktop')}
            sx={{ minWidth: 100 }}
          >
            Desktop
          </Button>
          <Button
            size="small"
            variant={viewportMode === 'mobile' ? 'contained' : 'outlined'}
            onClick={() => setViewportMode('mobile')}
            sx={{ minWidth: 100 }}
          >
            Mobile
          </Button>
        </Stack>
      </Box>

      {/* Layout Preview */}
      <Box
        sx={{
          position: 'relative',
          height: 320,
          maxWidth: isMobile ? 375 : '100%',
          mx: isMobile ? 'auto' : 0,
          borderRadius: 2,
          overflow: 'hidden',
          border: isDark
            ? '1px solid rgba(255,255,255,0.12)'
            : '1px solid rgba(15,23,42,0.12)',
          bgcolor: isDark ? 'rgba(17,24,39,0.40)' : 'rgba(248,250,252,1)',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Simulated LeftNav (Desktop Only) */}
        {!isMobile && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: navOpen ? 280 : 64,
              bgcolor: isDark
                ? 'rgba(15,23,42,0.80)'
                : 'rgba(255,255,255,0.95)',
              borderRight: isDark
                ? '1px solid rgba(255,255,255,0.12)'
                : '1px solid rgba(15,23,42,0.12)',
              transition: 'width 0.3s ease',
              zIndex: 1,
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.50)'
                    : 'rgba(15,23,42,0.50)',
                }}
              >
                {navOpen ? 'LeftNav' : 'Nav'}
              </Typography>
            </Box>
          </Box>
        )}

        {/* TopBar */}
        <TopBar
          navOpen={navOpen}
          navWidthExpanded={280}
          navWidthCollapsed={64}
          breakpoint="lg"
          position="absolute"
          left={
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton
                size="small"
                onClick={() => (isMobile ? undefined : setNavOpen(!navOpen))}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
              <Typography variant="h6" sx={{ fontSize: 16 }}>
                {isMobile ? 'App' : 'Application'}
              </Typography>
            </Stack>
          }
          center={
            !isMobile ? (
              <TextField
                size="small"
                placeholder="Search..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
            ) : undefined
          }
          right={
            <Stack direction="row" spacing={1} alignItems="center">
              {!isMobile && (
                <IconButton size="small">
                  <NotificationsIcon fontSize="small" />
                </IconButton>
              )}
              <Avatar sx={{ width: 28, height: 28 }}>JD</Avatar>
            </Stack>
          }
        />

        {/* Main Content Area */}
        <Box
          sx={{
            position: 'absolute',
            left: isMobile ? 0 : navOpen ? 280 : 64,
            top: 76,
            right: 0,
            bottom: 0,
            p: 3,
            transition: 'left 0.3s ease',
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(15,23,42,0.50)',
            }}
          >
            Main Content Area
          </Typography>
          <Typography
            sx={{
              fontSize: 11,
              mt: 1,
              color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(15,23,42,0.40)',
            }}
          >
            {isMobile
              ? 'TopBar spans full width on mobile'
              : 'TopBar coordinates with LeftNav on desktop'}
          </Typography>
        </Box>
      </Box>

      {/* Current State Display */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
          border: isDark
            ? '1px solid rgba(59,130,246,0.15)'
            : '1px solid rgba(59,130,246,0.12)',
        }}
      >
        <Stack spacing={1}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: isDark ? '#60a5fa' : '#2563eb',
            }}
          >
            Current State
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Viewport: {isMobile ? 'Mobile (< lg)' : 'Desktop (>= lg)'}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            TopBar Width:{' '}
            {isMobile ? '100%' : `calc(100% - ${navOpen ? '280' : '64'}px)`}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Center Slot: {isMobile ? 'Hidden' : 'Visible (Search)'}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
