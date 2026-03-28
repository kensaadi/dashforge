import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * BreadcrumbsNotes displays implementation guidance and best practices
 * Follows the numbered card pattern with blue theme
 */
export function BreadcrumbsNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Built on MUI Breadcrumbs',
      content:
        'Breadcrumbs is built on top of MUI Breadcrumbs component, inheriting its accessibility features (aria-current, aria-label) and responsive behavior. The component wraps MUI with intelligent path resolution and router integration.',
    },
    {
      title: 'Two Usage Modes',
      content:
        'Use controlled mode (items prop) for simple, explicit breadcrumb chains. Use tree mode (tree prop) for automatic path resolution from navigation hierarchies. Tree mode is ideal when your navigation structure matches your breadcrumb needs.',
    },
    {
      title: 'Pathname is Router-Agnostic',
      content:
        'The pathname prop accepts a plain string, making the component work with any router (React Router, Next.js, or custom). No router-specific dependencies required. Simply pass location.pathname or usePathname() value.',
    },
    {
      title: 'Router Integration',
      content:
        'Pass LinkComponent prop to integrate with your router. For React Router, use Link component. For Next.js, use Next Link. Use getLinkProps to transform href to router-specific props (e.g., href → to for React Router).',
    },
    {
      title: 'Active Item Handling',
      content:
        'The last item in the breadcrumb chain is automatically treated as the active (current) page. It renders as non-clickable text with aria-current="page" for accessibility. All preceding items render as clickable links.',
    },
    {
      title: 'Tree Resolution Algorithm',
      content:
        'When using tree mode, the component traverses the tree structure to find nodes matching the current pathname. Supports both exact and prefix matching (default). Home breadcrumb is automatically prepended unless disabled via includeHome.',
    },
    {
      title: 'Custom Label Rendering',
      content:
        'Labels can be strings or React nodes. Use React nodes for icons (e.g., <HomeIcon />). Use getLabel prop for i18n translation or dynamic rendering. The function receives the node and returns the rendered label.',
    },
    {
      title: 'Separator Customization',
      content:
        'Separator accepts any React node: strings ("/", "→", "•"), icons (<ChevronRightIcon />), or custom elements. Separator is rendered between items (not before first or after last item).',
    },
    {
      title: 'Disabled Items',
      content:
        'Set disabled: true on a node to render it as non-clickable text even if href is present. Useful for breadcrumbs in locked or restricted navigation paths where you want to show structure but prevent navigation.',
    },
    {
      title: 'Max Items & Ellipsis',
      content:
        'Use maxItems prop to collapse long breadcrumb chains. Middle items are replaced with ellipsis (…) while keeping first, last, and ellipsis button visible. This is a built-in MUI Breadcrumbs feature passed through the component.',
    },
    {
      title: 'Styling via slotProps',
      content:
        'Use slotProps to customize link and active item styles independently. Example: slotProps={{ link: { sx: { color: "primary.main" } }, active: { sx: { fontWeight: 700 } } }}. Root styles are controlled via sx prop.',
    },
    {
      title: 'Accessibility Built-In',
      content:
        'Component includes proper ARIA attributes: aria-label="breadcrumb" on root, aria-current="page" on active item. Focus ring styles are applied via :focus-visible for keyboard navigation. Works with screen readers out of the box.',
    },
  ];

  return (
    <Stack spacing={2.5}>
      {notes.map((note, index) => (
        <Box
          key={index}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.80)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.20)'
              : '1px solid rgba(59,130,246,0.15)',
            boxShadow: isDark
              ? '0 2px 8px rgba(0,0,0,0.15)'
              : '0 1px 4px rgba(15,23,42,0.08)',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {/* Number Badge */}
            <Box
              sx={{
                minWidth: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1.5,
                bgcolor: isDark
                  ? 'rgba(59,130,246,0.20)'
                  : 'rgba(59,130,246,0.12)',
                border: isDark
                  ? '1px solid rgba(59,130,246,0.30)'
                  : '1px solid rgba(59,130,246,0.25)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isDark ? '#60a5fa' : '#2563eb',
                }}
              >
                {index + 1}
              </Typography>
            </Box>

            {/* Content */}
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
              >
                {note.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {note.content}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
