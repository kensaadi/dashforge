import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Quick Start section for AppShell
 * Shows minimal setup and basic usage
 */
export function AppShellQuickStart() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
        border: isDark
          ? '1px solid rgba(59,130,246,0.20)'
          : '1px solid rgba(59,130,246,0.15)',
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: isDark ? '#60a5fa' : '#2563eb',
            }}
          >
            Quick Start
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.10)',
              border: isDark
                ? '1px solid rgba(34,197,94,0.30)'
                : '1px solid rgba(34,197,94,0.25)',
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: isDark ? '#86efac' : '#16a34a',
              }}
            >
              Basic Setup
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
                mb: 1,
              }}
            >
              Define navigation items
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                borderRadius: 1.5,
                fontSize: 13,
                lineHeight: 1.6,
                fontFamily: '"Fira Code", "SF Mono", Menlo, monospace',
                color: isDark ? '#e5e7eb' : '#1f2937',
                bgcolor: isDark ? 'rgba(0,0,0,0.30)' : 'rgba(248,250,252,0.80)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
                overflowX: 'auto',
              }}
            >
              {`import { LeftNavItem } from '@dashforge/ui';

const navItems: LeftNavItem[] = [
  {
    id: 'dashboard',
    type: 'item',
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    id: 'users',
    type: 'item',
    key: 'users',
    label: 'Users',
    icon: <PeopleIcon />,
  },
];`}
            </Box>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
                mb: 1,
              }}
            >
              Render the AppShell
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                borderRadius: 1.5,
                fontSize: 13,
                lineHeight: 1.6,
                fontFamily: '"Fira Code", "SF Mono", Menlo, monospace',
                color: isDark ? '#e5e7eb' : '#1f2937',
                bgcolor: isDark ? 'rgba(0,0,0,0.30)' : 'rgba(248,250,252,0.80)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
                overflowX: 'auto',
              }}
            >
              {`import { AppShell } from '@dashforge/ui';

<AppShell
  items={navItems}
  topBarLeft={<Typography variant="h6">My App</Typography>}
  topBarRight={<UserMenu />}
>
  <YourContent />
</AppShell>`}
            </Box>
          </Box>
        </Stack>

        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(34,197,94,0.10)' : 'rgba(34,197,94,0.08)',
            border: isDark
              ? '1px solid rgba(34,197,94,0.25)'
              : '1px solid rgba(34,197,94,0.20)',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: isDark ? '#86efac' : '#16a34a',
              }}
            >
              ✓
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
              }}
            >
              AppShell automatically handles responsive layout, drawer state,
              and spacing for fixed headers.
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
