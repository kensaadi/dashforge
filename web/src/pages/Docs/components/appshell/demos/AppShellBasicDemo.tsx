import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Basic AppShell demo - visual schematic representation
 * Shows the layout structure without rendering an actual nested sidebar
 */
export function AppShellBasicDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const navItems = [
    { icon: <HomeIcon fontSize="small" />, label: 'Home', active: true },
    {
      icon: <BarChartIcon fontSize="small" />,
      label: 'Analytics',
      active: false,
    },
    { icon: <PeopleIcon fontSize="small" />, label: 'Users', active: false },
    {
      icon: <SettingsIcon fontSize="small" />,
      label: 'Settings',
      active: false,
    },
  ];

  return (
    <Box
      sx={{
        height: 400,
        width: '100%',
        position: 'relative',
        display: 'flex',
        borderRadius: 1.5,
        overflow: 'hidden',
        border: isDark
          ? '2px solid rgba(255,255,255,0.10)'
          : '2px solid rgba(15,23,42,0.10)',
      }}
    >
      {/* LeftNav representation */}
      <Box
        sx={{
          width: 240,
          bgcolor: isDark ? 'rgba(17,24,39,0.95)' : 'rgba(248,250,252,0.95)',
          borderRight: isDark
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(15,23,42,0.08)',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(15,23,42,0.50)',
            mb: 2,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          LeftNav
        </Typography>
        <Stack spacing={0.5}>
          {navItems.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.25,
                borderRadius: 1,
                bgcolor: item.active
                  ? isDark
                    ? 'rgba(59,130,246,0.15)'
                    : 'rgba(59,130,246,0.10)'
                  : 'transparent',
                border: item.active
                  ? isDark
                    ? '1px solid rgba(59,130,246,0.30)'
                    : '1px solid rgba(59,130,246,0.20)'
                  : '1px solid transparent',
                color: item.active
                  ? isDark
                    ? '#60a5fa'
                    : '#2563eb'
                  : isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              {item.icon}
              <Typography
                sx={{ fontSize: 14, fontWeight: item.active ? 600 : 400 }}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Main content area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* TopBar representation */}
        <Box
          sx={{
            height: 64,
            bgcolor: isDark ? 'rgba(17,24,39,0.90)' : 'rgba(255,255,255,0.90)',
            borderBottom: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MenuIcon
              sx={{
                fontSize: 20,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: isDark
                  ? 'rgba(255,255,255,0.50)'
                  : 'rgba(15,23,42,0.50)',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              TopBar
            </Typography>
          </Box>
          <NotificationsIcon
            sx={{
              fontSize: 20,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          />
        </Box>

        {/* Main content */}
        <Box
          sx={{
            flex: 1,
            bgcolor: isDark ? '#0f172a' : '#f8fafc',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(15,23,42,0.50)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Main Content Area
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            AppShell composes LeftNav, TopBar, and main content into a complete
            application layout with automatic responsive behavior and state
            management.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
