import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { NumberField } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

/**
 * NumberFieldLayoutVariants demonstrates the different layout modes
 * Validates that NumberField follows the same layout system as TextField
 */
export function NumberFieldLayoutVariants() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={4}>
      <Typography
        variant="body1"
        sx={{
          fontSize: 16,
          lineHeight: 1.7,
          color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
        }}
      >
        NumberField supports three MUI variants: <code>outlined</code>{' '}
        (default), <code>filled</code>, and <code>standard</code>. The variant
        prop controls the visual style of the input field, maintaining
        consistency with MUI design patterns.
      </Typography>

      {/* Three-way comparison */}
      <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
        {/* Outlined Variant */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                minHeight: 28,
              }}
            >
              Outlined (Default)
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <DocsPreviewBlock
                minHeight={200}
                centerContent
                code={`<NumberField
  label="Price"
  name="price"
  placeholder="0.00"
  helperText="Enter amount in USD"
  fullWidth
/>`}
              >
                <NumberField
                  label="Price"
                  name="price"
                  placeholder="0.00"
                  helperText="Enter amount in USD"
                  fullWidth
                />
              </DocsPreviewBlock>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: 14,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.60)'
                  : 'rgba(15,23,42,0.60)',
              }}
            >
              <strong>What to observe:</strong> Standard outlined border style.
              Label animates up when field is focused or has value. Most common
              variant for forms.
            </Typography>
          </Stack>
        </Grid>

        {/* Filled Variant */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                minHeight: 28,
              }}
            >
              Filled Variant
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <DocsPreviewBlock
                minHeight={200}
                centerContent
                code={`<NumberField
  label="Price"
  name="price"
  placeholder="0.00"
  helperText="Enter amount in USD"
  variant="filled"
  fullWidth
/>`}
              >
                <NumberField
                  label="Price"
                  name="price"
                  placeholder="0.00"
                  helperText="Enter amount in USD"
                  variant="filled"
                  fullWidth
                />
              </DocsPreviewBlock>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: 14,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.60)'
                  : 'rgba(15,23,42,0.60)',
              }}
            >
              <strong>What to observe:</strong> Background-filled style with
              bottom border. Provides visual weight and clear input area. Helper
              text appears below.
            </Typography>
          </Stack>
        </Grid>

        {/* Standard Variant */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                minHeight: 28,
              }}
            >
              Standard Variant
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <DocsPreviewBlock
                minHeight={200}
                centerContent
                code={`<NumberField
  label="Price"
  name="price"
  placeholder="0.00"
  helperText="Enter amount in USD"
  variant="standard"
  fullWidth
/>`}
              >
                <NumberField
                  label="Price"
                  name="price"
                  placeholder="0.00"
                  helperText="Enter amount in USD"
                  variant="standard"
                  fullWidth
                />
              </DocsPreviewBlock>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: 14,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.60)'
                  : 'rgba(15,23,42,0.60)',
              }}
            >
              <strong>What to observe:</strong> Minimal style with only bottom
              border. Clean, simple appearance for focused forms. Label floats
              above on focus.
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
