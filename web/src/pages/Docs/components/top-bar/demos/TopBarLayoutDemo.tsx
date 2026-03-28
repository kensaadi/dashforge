import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { TopBar } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { useState } from 'react';

/**
 * TopBarLayoutDemo demonstrates dashboard shell layout with TopBar and LeftNav coordination
 */
export function TopBarLayoutDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [navOpen, setNavOpen] = useState(true);

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
            Navigation State:
          </Typography>
          <Button
            size="small"
            variant={navOpen ? 'contained' : 'outlined'}
            onClick={() => setNavOpen(true)}
            sx={{ minWidth: 100 }}
          >
            Expanded
          </Button>
          <Button
            size="small"
            variant={!navOpen ? 'contained' : 'outlined'}
            onClick={() => setNavOpen(false)}
            sx={{ minWidth: 100 }}
          >
            Collapsed
          </Button>
        </Stack>
      </Box>

      {/* Layout Preview */}
      <Box
        sx={{
          position: 'relative',
          height: 320,
          borderRadius: 2,
          overflow: 'hidden',
          border: isDark
            ? '1px solid rgba(255,255,255,0.12)'
            : '1px solid rgba(15,23,42,0.12)',
          bgcolor: isDark ? 'rgba(17,24,39,0.40)' : 'rgba(248,250,252,1)',
        }}
      >
        {/* Simulated LeftNav */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: navOpen ? 280 : 64,
            bgcolor: isDark ? 'rgba(15,23,42,0.80)' : 'rgba(255,255,255,0.95)',
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
              {navOpen ? 'LeftNav (Expanded)' : 'Nav'}
            </Typography>
          </Box>
        </Box>

        {/* TopBar */}
        <TopBar
          navOpen={navOpen}
          navWidthExpanded={280}
          navWidthCollapsed={64}
          position="absolute"
          left={
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton size="small" onClick={() => setNavOpen(!navOpen)}>
                <MenuIcon fontSize="small" />
              </IconButton>
              <Typography variant="h6" sx={{ fontSize: 16 }}>
                Dashboard
              </Typography>
            </Stack>
          }
          right={
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton size="small">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
              <Avatar sx={{ width: 28, height: 28 }}>JD</Avatar>
            </Stack>
          }
        />

        {/* Main Content Area */}
        <Box
          sx={{
            position: 'absolute',
            left: navOpen ? 280 : 64,
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
            TopBar automatically adjusts width when navigation toggles
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
            Current Layout State
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Navigation: {navOpen ? 'Expanded (280px)' : 'Collapsed (64px)'}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            TopBar Width: calc(100% - {navOpen ? '280' : '64'}px)
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
