import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Breadcrumbs } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * BreadcrumbsTreeDemo demonstrates automatic path resolution from a tree structure
 * Shows how breadcrumbs auto-resolve based on current pathname
 */
export function BreadcrumbsTreeDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const [currentPath, setCurrentPath] = useState(
    '/dashboard/analytics/reports'
  );

  const tree = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      children: [
        {
          id: 'analytics',
          label: 'Analytics',
          href: '/dashboard/analytics',
          children: [
            {
              id: 'reports',
              label: 'Reports',
              href: '/dashboard/analytics/reports',
            },
            {
              id: 'insights',
              label: 'Insights',
              href: '/dashboard/analytics/insights',
            },
          ],
        },
        {
          id: 'settings',
          label: 'Settings',
          href: '/dashboard/settings',
          children: [
            {
              id: 'account',
              label: 'Account',
              href: '/dashboard/settings/account',
            },
          ],
        },
      ],
    },
  ];

  const paths = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/analytics', label: 'Analytics' },
    { path: '/dashboard/analytics/reports', label: 'Reports' },
    { path: '/dashboard/analytics/insights', label: 'Insights' },
    { path: '/dashboard/settings', label: 'Settings' },
    { path: '/dashboard/settings/account', label: 'Account' },
  ];

  return (
    <Stack spacing={3}>
      {/* Breadcrumbs Display */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.90)',
          border: isDark
            ? '1px solid rgba(59,130,246,0.20)'
            : '1px solid rgba(59,130,246,0.15)',
        }}
      >
        <Breadcrumbs pathname={currentPath} tree={tree} />
      </Box>

      {/* Path Selection */}
      <Box>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
            mb: 2,
          }}
        >
          Navigate to:
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          {paths.map((p) => (
            <Button
              key={p.path}
              onClick={() => setCurrentPath(p.path)}
              variant={currentPath === p.path ? 'contained' : 'outlined'}
              size="small"
              sx={{
                textTransform: 'none',
                fontSize: 13,
              }}
            >
              {p.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Current Path Display */}
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
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: isDark ? '#60a5fa' : '#2563eb',
            mb: 0.5,
          }}
        >
          Current pathname:
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            fontFamily: 'monospace',
            color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
          }}
        >
          {currentPath}
        </Typography>
      </Box>
    </Stack>
  );
}
