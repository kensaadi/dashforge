import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPlaygroundControls } from './DocsPlaygroundControls';
import { DocsPlaygroundPreview } from './DocsPlaygroundPreview';
import { DocsCodePreview } from './DocsCodePreview';
import type { DocsPlaygroundProps } from './playground.types';

/**
 * DocsPlayground is the main composition component for live playgrounds
 * Provides a complete interactive documentation experience with controls, preview, and generated code
 *
 * Layout:
 * - Desktop: Controls left, Preview + Code right (emphasized)
 * - Mobile: Stacked vertically
 */
export function DocsPlayground({
  title = 'Live Playground',
  description,
  controls,
  preview,
  code,
}: DocsPlaygroundProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: isDark
          ? 'linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(31,41,55,0.90) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
        border: isDark
          ? '1px solid rgba(139,92,246,0.12)'
          : '1px solid rgba(139,92,246,0.08)',
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.06) inset'
          : '0 4px 24px rgba(15,23,42,0.08), 0 0 0 1px rgba(139,92,246,0.04) inset',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: isDark
            ? 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.3) 50%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.2) 50%, transparent 100%)',
        },
      }}
    >
      <Box sx={{ p: { xs: 4, md: 6 } }}>
        <Stack spacing={{ xs: 4, md: 5 }}>
          {title && (
            <Box sx={{ maxWidth: 800 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.5,
                  mb: 2.5,
                  borderRadius: 1.5,
                  bgcolor: isDark
                    ? 'rgba(139,92,246,0.15)'
                    : 'rgba(139,92,246,0.08)',
                  border: isDark
                    ? '1px solid rgba(139,92,246,0.25)'
                    : '1px solid rgba(139,92,246,0.15)',
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'rgba(139,92,246,0.85)',
                    boxShadow: '0 0 8px rgba(139,92,246,0.5)',
                  }}
                />
                <Typography
                  variant="overline"
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: isDark
                      ? 'rgba(139,92,246,0.95)'
                      : 'rgba(139,92,246,0.90)',
                  }}
                >
                  Interactive Playground
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: 26, md: 34 },
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color: isDark
                    ? 'rgba(255,255,255,0.98)'
                    : 'rgba(15,23,42,0.98)',
                  mb: description ? 2 : 0,
                  letterSpacing: '-0.03em',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 100%)'
                    : 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.80) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {title}
              </Typography>
              {description && (
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: 15, md: 16 },
                    lineHeight: 1.75,
                    color: isDark
                      ? 'rgba(255,255,255,0.68)'
                      : 'rgba(15,23,42,0.68)',
                    maxWidth: 680,
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          )}

          <Grid container spacing={{ xs: 3, md: 4 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <DocsPlaygroundControls>{controls}</DocsPlaygroundControls>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={{ xs: 3, md: 4 }}>
                <DocsPlaygroundPreview>{preview}</DocsPlaygroundPreview>
                <DocsCodePreview code={code} />
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Box>
  );
}
