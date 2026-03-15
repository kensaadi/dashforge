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
        p: 3,
        borderRadius: 1,
        bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
      }}
    >
      <Stack spacing={2.5}>
        <Typography
          variant="overline"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(15,23,42,0.50)',
          }}
        >
          Controls
        </Typography>
        <Stack spacing={2}>{children}</Stack>
      </Stack>
    </Box>
  );
}
