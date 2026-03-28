import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Breadcrumbs } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * BreadcrumbsExamples displays interactive Breadcrumbs examples
 * Each example shows both the rendered component and its code
 */
export function BreadcrumbsExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'Basic Breadcrumbs',
      description: 'Simple navigation path with clickable links',
      code: `const items = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'dashboard', label: 'Dashboard' }
];

<Breadcrumbs pathname="/dashboard" items={items} />`,
      component: (
        <Breadcrumbs
          pathname="/dashboard"
          items={[
            { id: 'home', label: 'Home', href: '/' },
            { id: 'dashboard', label: 'Dashboard' },
          ]}
        />
      ),
    },
    {
      title: 'Nested Navigation',
      description: 'Multi-level hierarchy with 4 levels',
      code: `const items = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'products', label: 'Products', href: '/products' },
  { id: 'category', label: 'Electronics', href: '/products/electronics' },
  { id: 'product', label: 'Laptop' }
];

<Breadcrumbs pathname="/products/electronics/laptop" items={items} />`,
      component: (
        <Breadcrumbs
          pathname="/products/electronics/laptop"
          items={[
            { id: 'home', label: 'Home', href: '/' },
            { id: 'products', label: 'Products', href: '/products' },
            {
              id: 'category',
              label: 'Electronics',
              href: '/products/electronics',
            },
            { id: 'product', label: 'Laptop' },
          ]}
        />
      ),
    },
    {
      title: 'Custom Separator',
      description: 'Breadcrumbs with chevron icon separator',
      code: `const items = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'settings', label: 'Settings', href: '/settings' },
  { id: 'account', label: 'Account' }
];

<Breadcrumbs 
  pathname="/settings/account" 
  items={items}
  separator={<ChevronRightIcon fontSize="small" />}
/>`,
      component: (
        <Breadcrumbs
          pathname="/settings/account"
          items={[
            { id: 'home', label: 'Home', href: '/' },
            { id: 'settings', label: 'Settings', href: '/settings' },
            { id: 'account', label: 'Account' },
          ]}
          separator={<ChevronRightIcon fontSize="small" />}
        />
      ),
    },
    {
      title: 'With Icons',
      description: 'Home icon in first breadcrumb item',
      code: `const items = [
  { id: 'home', label: <HomeIcon fontSize="small" />, href: '/' },
  { id: 'blog', label: 'Blog', href: '/blog' },
  { id: 'article', label: 'Getting Started' }
];

<Breadcrumbs pathname="/blog/getting-started" items={items} />`,
      component: (
        <Breadcrumbs
          pathname="/blog/getting-started"
          items={[
            { id: 'home', label: <HomeIcon fontSize="small" />, href: '/' },
            { id: 'blog', label: 'Blog', href: '/blog' },
            { id: 'article', label: 'Getting Started' },
          ]}
        />
      ),
    },
    {
      title: 'Disabled Items',
      description: 'Non-clickable breadcrumb items',
      code: `const items = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'reports', label: 'Reports', href: '/reports', disabled: true },
  { id: 'analytics', label: 'Analytics' }
];

<Breadcrumbs pathname="/reports/analytics" items={items} />`,
      component: (
        <Breadcrumbs
          pathname="/reports/analytics"
          items={[
            { id: 'home', label: 'Home', href: '/' },
            {
              id: 'reports',
              label: 'Reports',
              href: '/reports',
              disabled: true,
            },
            { id: 'analytics', label: 'Analytics' },
          ]}
        />
      ),
    },
    {
      title: 'Max Items',
      description: 'Collapsed breadcrumbs with ellipsis',
      code: `const items = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'level1', label: 'Level 1', href: '/level1' },
  { id: 'level2', label: 'Level 2', href: '/level1/level2' },
  { id: 'level3', label: 'Level 3', href: '/level1/level2/level3' },
  { id: 'level4', label: 'Level 4' }
];

<Breadcrumbs 
  pathname="/level1/level2/level3/level4" 
  items={items}
  maxItems={3}
/>`,
      component: (
        <Breadcrumbs
          pathname="/level1/level2/level3/level4"
          items={[
            { id: 'home', label: 'Home', href: '/' },
            { id: 'level1', label: 'Level 1', href: '/level1' },
            { id: 'level2', label: 'Level 2', href: '/level1/level2' },
            {
              id: 'level3',
              label: 'Level 3',
              href: '/level1/level2/level3',
            },
            { id: 'level4', label: 'Level 4' },
          ]}
          maxItems={3}
        />
      ),
    },
  ];

  return (
    <Stack spacing={3.5}>
      {examples.map((example) => (
        <Box key={example.title}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.5,
                }}
              >
                {example.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  color: isDark
                    ? 'rgba(255,255,255,0.65)'
                    : 'rgba(15,23,42,0.65)',
                }}
              >
                {example.description}
              </Typography>
            </Box>

            <DocsPreviewBlock code={example.code} badge="">
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
