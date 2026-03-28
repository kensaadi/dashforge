import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

interface DocsSectionProps {
  /**
   * Section ID for anchor links
   */
  id: string;

  /**
   * Section title
   */
  title: string;

  /**
   * Section description
   */
  description: string;

  /**
   * Section content
   */
  children: React.ReactNode;

  /**
   * Spacing between header and content (in MUI spacing units)
   * @default 4
   */
  spacing?: number;
}

/**
 * Standardized section wrapper for docs pages
 * Provides consistent header styling and spacing
 */
export function DocsSection({
  id,
  title,
  description,
  children,
  spacing = 4,
}: DocsSectionProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={spacing} id={id}>
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
      {children}
    </Stack>
  );
}
