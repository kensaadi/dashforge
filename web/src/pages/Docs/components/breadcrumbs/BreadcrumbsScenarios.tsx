import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { BreadcrumbsTreeDemo } from './demos/BreadcrumbsTreeDemo';
import { BreadcrumbsCustomDemo } from './demos/BreadcrumbsCustomDemo';

/**
 * BreadcrumbsScenarios displays realistic navigation scenarios
 * Shows tree-based resolution and custom rendering
 */
export function BreadcrumbsScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={6}>
      {/* Scenario 1: Tree-Based Resolution */}
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
            Automatic Path Resolution
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
              mb: 2,
            }}
          >
            Define a navigation tree once and let Breadcrumbs automatically
            resolve the path hierarchy. Perfect for dashboard layouts where the
            structure is known but the current page changes dynamically.
          </Typography>
        </Box>

        <DocsPreviewBlock
          code={`const tree = [
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
          { id: 'reports', label: 'Reports', href: '/dashboard/analytics/reports' },
          { id: 'insights', label: 'Insights', href: '/dashboard/analytics/insights' }
        ]
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/dashboard/settings',
        children: [
          { id: 'account', label: 'Account', href: '/dashboard/settings/account' }
        ]
      }
    ]
  }
];

<Breadcrumbs pathname={currentPath} tree={tree} />`}
          badge="Interactive Demo"
        >
          <BreadcrumbsTreeDemo />
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
            Tree-based resolution eliminates the need to manually construct
            breadcrumb arrays on every page. Define your navigation structure
            once (often from your router config), and breadcrumbs resolve
            automatically based on the current pathname.
          </Typography>
        </Box>
      </Stack>

      {/* Scenario 2: Custom Rendering */}
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
            Custom Separators & Icons
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
              mb: 2,
            }}
          >
            Customize breadcrumb appearance with custom separators, icons, and
            label rendering. Supports React nodes for full flexibility.
          </Typography>
        </Box>

        <DocsPreviewBlock
          code={`import HomeIcon from '@mui/icons-material/Home';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const items = [
  { id: 'home', label: <HomeIcon fontSize="small" />, href: '/' },
  { id: 'products', label: 'Products', href: '/products' },
  { id: 'category', label: 'Electronics', href: '/products/electronics' },
  { id: 'product', label: 'Laptop' }
];

<Breadcrumbs 
  pathname="/products/electronics/laptop"
  items={items}
  separator={<ChevronRightIcon fontSize="small" />}
/>`}
          badge="Interactive Demo"
        >
          <BreadcrumbsCustomDemo />
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
            Custom rendering allows you to match your brand's design system.
            Replace text with icons, use custom separators, or integrate i18n
            via the getLabel prop. The component stays flexible without
            requiring component extension.
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
