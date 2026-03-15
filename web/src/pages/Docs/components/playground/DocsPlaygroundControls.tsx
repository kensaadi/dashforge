import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';
import type { DocsPlaygroundControlsProps } from './playground.types';

/**
 * DocsPlaygroundControls wraps the controls panel
 * Provides a visually grouped area for interactive controls
 */
export function DocsPlaygroundControls({
  children,
}: DocsPlaygroundControlsProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: 2.5,
        bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.90)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.12)',
        boxShadow: isDark
          ? '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03) inset'
          : '0 2px 12px rgba(15,23,42,0.08), 0 0 0 1px rgba(255,255,255,0.8) inset',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: isDark
            ? '0 6px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset'
            : '0 4px 16px rgba(15,23,42,0.12), 0 0 0 1px rgba(255,255,255,0.9) inset',
        },
      }}
    >
      <Box
        sx={{
          px: 3.5,
          py: 3,
          bgcolor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(248,250,252,0.50)',
          borderBottom: isDark
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid rgba(15,23,42,0.06)',
        }}
      >
        <Typography
          variant="overline"
          sx={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.3,
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          }}
        >
          Configuration
        </Typography>
      </Box>
      <Box sx={{ p: { xs: 3, md: 3.5 } }}>
        <Stack spacing={3}>{children}</Stack>
      </Box>
    </Box>
  );
}
