import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
        borderRadius: 2.5,
        bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.90)',
        border: isDark
          ? '1px solid rgba(139,92,246,0.15)'
          : '1px solid rgba(139,92,246,0.10)',
        boxShadow: isDark
          ? '0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(139,92,246,0.08) inset'
          : '0 4px 20px rgba(15,23,42,0.10), 0 0 0 1px rgba(139,92,246,0.05) inset',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: isDark
            ? '0 12px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(139,92,246,0.12) inset'
            : '0 6px 28px rgba(15,23,42,0.14), 0 0 0 1px rgba(139,92,246,0.08) inset',
        },
      }}
    >
      <Box
        sx={{
          px: 3.5,
          py: 2.5,
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
            color: isDark ? 'rgba(139,92,246,0.85)' : 'rgba(139,92,246,0.80)',
          }}
        >
          Live Preview
        </Typography>
      </Box>
      <Box
        sx={{
          p: { xs: 6, md: 8 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 240,
          position: 'relative',
          bgcolor: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(248,250,252,0.60)',
          backgroundImage: isDark
            ? `
              radial-gradient(circle at 25% 25%, rgba(139,92,246,0.12) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(59,130,246,0.10) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 70%)
            `
            : `
              radial-gradient(circle at 25% 25%, rgba(139,92,246,0.08) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(59,130,246,0.06) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(139,92,246,0.04) 0%, transparent 70%)
            `,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark
              ? 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.1) 100%)'
              : 'radial-gradient(circle at center, transparent 0%, rgba(15,23,42,0.02) 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
