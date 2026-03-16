import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Select } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

/**
 * SelectLayoutVariants demonstrates the different layout modes
 * This section validates the layout architecture through visual comparison
 */
export function SelectLayoutVariants() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const options = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
  ];

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
        Select supports three layout modes: <code>floating</code> (default),{' '}
        <code>stacked</code>, and <code>inline</code>. The layout prop controls
        label positioning and composition independently of the MUI variant
        (outlined/filled/standard).
      </Typography>

      {/* Three-way comparison */}
      <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
        {/* Floating Layout */}
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
              Floating (Default)
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <DocsPreviewBlock
                minHeight={200}
                centerContent
                code={`<Select
  label="Country"
  name="country"
  options={options}
  helperText="Select your country"
  fullWidth
/>`}
              >
                <Select
                  label="Country"
                  name="country"
                  options={options}
                  helperText="Select your country"
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
              <strong>What to observe:</strong> Standard MUI floating label
              behavior. Label animates up when field is focused or has value.
              This is the migration-friendly default.
            </Typography>
          </Stack>
        </Grid>

        {/* Stacked Layout */}
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
              Stacked Layout
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <DocsPreviewBlock
                minHeight={200}
                centerContent
                code={`<Select
  label="Country"
  name="country"
  options={options}
  helperText="Select your country"
  layout="stacked"
  fullWidth
/>`}
              >
                <Select
                  label="Country"
                  name="country"
                  options={options}
                  helperText="Select your country"
                  layout="stacked"
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
              <strong>What to observe:</strong> Label rendered above the input
              as a static label. This layout is ideal for forms where you want
              clear vertical hierarchy and maximum label visibility.
            </Typography>
          </Stack>
        </Grid>

        {/* Inline Layout */}
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
              Inline Layout
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <DocsPreviewBlock
                minHeight={200}
                centerContent
                code={`<Select
  label="Country"
  name="country"
  options={options}
  helperText="Select your country"
  layout="inline"
  fullWidth
/>`}
              >
                <Select
                  label="Country"
                  name="country"
                  options={options}
                  helperText="Select your country"
                  layout="inline"
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
              <strong>What to observe:</strong> Label positioned to the left of
              the input. This layout is ideal for dense forms or settings panels
              where horizontal space is available.
            </Typography>
          </Stack>
        </Grid>
      </Grid>

      {/* Additional layout examples */}
      <Stack spacing={3}>
        <Typography
          variant="h6"
          sx={{
            fontSize: 20,
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            mt: 2,
          }}
        >
          Layout Comparison
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DocsPreviewBlock
              badge="Floating"
              centerContent
              code={`<Select
  label="Priority"
  name="priority"
  options={[
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]}
  fullWidth
/>`}
            >
              <Select
                label="Priority"
                name="priority"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
                fullWidth
              />
            </DocsPreviewBlock>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <DocsPreviewBlock
              badge="Stacked"
              centerContent
              code={`<Select
  label="Priority"
  name="priority"
  options={[
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]}
  layout="stacked"
  fullWidth
/>`}
            >
              <Select
                label="Priority"
                name="priority"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
                layout="stacked"
                fullWidth
              />
            </DocsPreviewBlock>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <DocsPreviewBlock
              badge="Inline"
              centerContent
              code={`<Select
  label="Priority"
  name="priority"
  options={[
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]}
  layout="inline"
  fullWidth
/>`}
            >
              <Select
                label="Priority"
                name="priority"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
                layout="inline"
                fullWidth
              />
            </DocsPreviewBlock>
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
}
