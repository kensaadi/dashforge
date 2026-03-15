import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import type { DocsPlaygroundPreviewProps } from './playground.types';

/**
 * DocsPlaygroundPreview wraps the live component preview
 * Provides a visually isolated surface with theme-aware styling
 */
export function DocsPlaygroundPreview({
  children,
}: DocsPlaygroundPreviewProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 1,
        bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
      }}
    >
      {children}
    </Box>
  );
}
