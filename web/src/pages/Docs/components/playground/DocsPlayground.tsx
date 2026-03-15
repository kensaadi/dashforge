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
 * - Desktop: Controls left, Preview + Code right
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
    <Stack spacing={3}>
      {title && (
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: 20, md: 24 },
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
              mb: description ? 1 : 0,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant="body2"
              sx={{
                fontSize: 14,
                color: isDark
                  ? 'rgba(255,255,255,0.65)'
                  : 'rgba(15,23,42,0.65)',
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <DocsPlaygroundControls>{controls}</DocsPlaygroundControls>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <DocsPlaygroundPreview>{preview}</DocsPlaygroundPreview>
            <DocsCodePreview code={code} />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
