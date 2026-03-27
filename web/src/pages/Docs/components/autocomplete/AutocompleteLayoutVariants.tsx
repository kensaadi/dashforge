import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Autocomplete } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

/**
 * AutocompleteLayoutVariants demonstrates the different visual styles
 */
export function AutocompleteLayoutVariants() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const options = ['United States', 'Canada', 'Mexico', 'United Kingdom'];

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
        Autocomplete uses MUI TextField internally, which supports the standard{' '}
        <code>standard</code> variant (default). The component focuses on search
        and selection functionality with a clean, consistent appearance.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
              }}
            >
              Default Appearance
            </Typography>
            <DocsPreviewBlock
              minHeight={180}
              centerContent
              code={`<Autocomplete
  name="country"
  label="Country"
  options={options}
/>`}
            >
              <Autocomplete
                name="country-standard"
                label="Country"
                options={options}
              />
            </DocsPreviewBlock>
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
              Clean and minimal with underline. Always in freeSolo mode for
              flexible text entry.
            </Typography>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
              }}
            >
              With Helper Text
            </Typography>
            <DocsPreviewBlock
              minHeight={180}
              centerContent
              code={`<Autocomplete
  name="country"
  label="Country"
  options={options}
  helperText="Select or type a country"
/>`}
            >
              <Autocomplete
                name="country-helper"
                label="Country"
                options={options}
                helperText="Select or type a country"
              />
            </DocsPreviewBlock>
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
              Add helpful instructions or context below the input field.
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
