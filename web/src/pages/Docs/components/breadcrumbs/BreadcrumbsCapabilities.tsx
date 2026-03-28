import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * BreadcrumbsCapabilities displays capability cards following the enforced pattern
 * Max 3 cards, max 3 bullets per card, responsive grid layout
 */
export function BreadcrumbsCapabilities() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={4}>
      {/* Introduction */}
      <Box sx={{ maxWidth: 720 }}>
        <Typography
          variant="body1"
          sx={{
            fontSize: 16,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
          }}
        >
          Breadcrumbs provides flexible navigation with router integration,
          automatic path resolution from tree structures, and extensive
          customization options for labels, separators, and rendering.
        </Typography>
      </Box>

      {/* Capability Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(3, minmax(0, 1fr))',
          },
          gap: { xs: 3, md: 3 },
        }}
      >
        {/* Card 1: Flexible Structure */}
        <Box
          sx={{
            p: { xs: 3, md: 3.5 },
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.80)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.20)'
              : '1px solid rgba(59,130,246,0.15)',
            boxShadow: isDark
              ? '0 4px 16px rgba(0,0,0,0.20)'
              : '0 2px 12px rgba(15,23,42,0.08)',
            transition: 'all 0.2s ease',
            ':hover': {
              boxShadow: isDark
                ? '0 8px 24px rgba(0,0,0,0.30)'
                : '0 4px 20px rgba(15,23,42,0.12)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Stack spacing={2.5}>
            {/* Header */}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: isDark ? '#ffffff' : '#0f172a',
                  mb: 1,
                }}
              >
                Flexible Structure
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isDark
                    ? 'rgba(59,130,246,0.15)'
                    : 'rgba(59,130,246,0.10)',
                  border: isDark
                    ? '1px solid rgba(59,130,246,0.30)'
                    : '1px solid rgba(59,130,246,0.25)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: isDark ? '#60a5fa' : '#2563eb',
                  }}
                >
                  Navigation
                </Typography>
              </Box>
            </Box>

            {/* Description */}
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
              Use controlled items array or automatic tree resolution. Supports
              nested hierarchies with custom matching logic.
            </Typography>

            {/* Bullet Points */}
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Controlled or tree-based
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Automatic path resolution
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Nested hierarchy support
                </Typography>
              </Box>
            </Stack>

            {/* Code Example */}
            <DocsCodeBlock
              code={`const items = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'page', label: 'Current Page' }
];

<Breadcrumbs pathname="/page" items={items} />`}
              language="tsx"
            />
          </Stack>
        </Box>

        {/* Card 2: Router Integration */}
        <Box
          sx={{
            p: { xs: 3, md: 3.5 },
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.80)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.20)'
              : '1px solid rgba(59,130,246,0.15)',
            boxShadow: isDark
              ? '0 4px 16px rgba(0,0,0,0.20)'
              : '0 2px 12px rgba(15,23,42,0.08)',
            transition: 'all 0.2s ease',
            ':hover': {
              boxShadow: isDark
                ? '0 8px 24px rgba(0,0,0,0.30)'
                : '0 4px 20px rgba(15,23,42,0.12)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Stack spacing={2.5}>
            {/* Header */}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: isDark ? '#ffffff' : '#0f172a',
                  mb: 1,
                }}
              >
                Router Integration
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isDark
                    ? 'rgba(59,130,246,0.15)'
                    : 'rgba(59,130,246,0.10)',
                  border: isDark
                    ? '1px solid rgba(59,130,246,0.30)'
                    : '1px solid rgba(59,130,246,0.25)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: isDark ? '#60a5fa' : '#2563eb',
                  }}
                >
                  Framework Agnostic
                </Typography>
              </Box>
            </Box>

            {/* Description */}
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
              Works with any router. Pass custom LinkComponent for React Router
              or Next.js Link integration.
            </Typography>

            {/* Bullet Points */}
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Custom link components
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Framework agnostic design
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  getLinkProps for customization
                </Typography>
              </Box>
            </Stack>

            {/* Code Example */}
            <DocsCodeBlock
              code={`import { Link } from 'react-router-dom';

<Breadcrumbs 
  pathname="/page"
  items={items}
  LinkComponent={Link}
  getLinkProps={(node) => ({ to: node.href })}
/>`}
              language="tsx"
            />
          </Stack>
        </Box>

        {/* Card 3: Custom Rendering */}
        <Box
          sx={{
            p: { xs: 3, md: 3.5 },
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.80)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.20)'
              : '1px solid rgba(59,130,246,0.15)',
            boxShadow: isDark
              ? '0 4px 16px rgba(0,0,0,0.20)'
              : '0 2px 12px rgba(15,23,42,0.08)',
            transition: 'all 0.2s ease',
            ':hover': {
              boxShadow: isDark
                ? '0 8px 24px rgba(0,0,0,0.30)'
                : '0 4px 20px rgba(15,23,42,0.12)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Stack spacing={2.5}>
            {/* Header */}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: isDark ? '#ffffff' : '#0f172a',
                  mb: 1,
                }}
              >
                Custom Rendering
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isDark
                    ? 'rgba(59,130,246,0.15)'
                    : 'rgba(59,130,246,0.10)',
                  border: isDark
                    ? '1px solid rgba(59,130,246,0.30)'
                    : '1px solid rgba(59,130,246,0.25)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: isDark ? '#60a5fa' : '#2563eb',
                  }}
                >
                  Flexible
                </Typography>
              </Box>
            </Box>

            {/* Description */}
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
              Customize labels with React nodes or i18n hooks. Control
              separators, icons, and styling via props.
            </Typography>

            {/* Bullet Points */}
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Custom separators and icons
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  getLabel for i18n
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  slotProps for styling
                </Typography>
              </Box>
            </Stack>

            {/* Code Example */}
            <DocsCodeBlock
              code={`<Breadcrumbs 
  pathname="/page"
  items={items}
  separator={<ChevronRightIcon />}
  getLabel={(node) => t(node.label)}
  slotProps={{ link: { sx: { color: 'primary.main' } } }}
/>`}
              language="tsx"
            />
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}
