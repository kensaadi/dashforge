import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';
import { useDashTheme } from '@dashforge/theme-core';

export interface RelatedLink {
  label: string;
  path: string;
  description?: string;
}

interface DocsRelatedSectionProps {
  /**
   * Array of related links to display
   */
  links: RelatedLink[];

  /**
   * Section title
   * @default "Related Topics"
   */
  title?: string;

  /**
   * Section description
   * @default "Explore related documentation"
   */
  description?: string;
}

/**
 * Standardized "Related Topics" section for docs pages
 * Displays a list of related documentation pages with consistent styling
 */
export function DocsRelatedSection({
  links,
  title = 'Related Topics',
  description = 'Explore related documentation',
}: DocsRelatedSectionProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={4} id="related">
      <Box>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            color: isDark ? '#ffffff' : '#0f172a',
            mb: 2,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: 17,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          {description}
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        {links.map((link) => (
          <Box
            key={link.path}
            sx={{
              p: 2.5,
              borderRadius: 1.5,
              bgcolor: isDark
                ? 'rgba(139,92,246,0.04)'
                : 'rgba(139,92,246,0.03)',
              border: isDark
                ? '1px solid rgba(139,92,246,0.12)'
                : '1px solid rgba(139,92,246,0.10)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: isDark
                  ? 'rgba(139,92,246,0.08)'
                  : 'rgba(139,92,246,0.06)',
                borderColor: isDark
                  ? 'rgba(139,92,246,0.20)'
                  : 'rgba(139,92,246,0.18)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <Box
              component={RouterLink}
              to={link.path}
              sx={{
                textDecoration: 'none',
                display: 'block',
              }}
            >
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: isDark ? '#a78bfa' : '#7c3aed',
                  mb: link.description ? 1 : 0,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {link.label} →
              </Typography>
              {link.description && (
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  {link.description}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
