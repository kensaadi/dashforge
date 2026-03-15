import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { TextField } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

/**
 * TextFieldLayoutVariants demonstrates the different layout modes
 * This section validates the layout architecture through visual comparison
 */
export function TextFieldLayoutVariants() {
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
        TextField supports two layout modes: <code>stacked</code> (default) and{' '}
        <code>inline</code>. The layout prop controls label positioning and
        spacing independently of the MUI variant (outlined/filled/standard).
      </Typography>

      {/* Side-by-side comparison */}
      <Grid container spacing={3}>
        {/* Stacked Layout */}
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
              Stacked Layout (Default)
            </Typography>
            <DocsPreviewBlock
              code={`<TextField
  label="Email"
  name="email"
  placeholder="Enter your email"
  helperText="We will never share your email."
  fullWidth
/>`}
            >
              <TextField
                label="Email"
                name="email"
                placeholder="Enter your email"
                helperText="We will never share your email."
                fullWidth
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
              <strong>What to observe:</strong> Label appears above the input
              field. Helper text appears below the input. This is the standard
              form field pattern.
            </Typography>
          </Stack>
        </Grid>

        {/* Inline Layout */}
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
              Inline Layout
            </Typography>
            <DocsPreviewBlock
              minHeight={160}
              code={`<TextField
  label="Email"
  name="email"
  placeholder="Enter your email"
  helperText="We will never share your email."
  layout="inline"
  fullWidth
/>`}
            >
              <TextField
                label="Email"
                name="email"
                placeholder="Enter your email"
                helperText="We will never share your email. "
                layout="inline"
                fullWidth
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
              <strong>What to observe:</strong> Label appears to the left of the
              input field, aligned to the top. Helper text appears below the
              input (not below the label). Useful for compact horizontal forms.
            </Typography>
          </Stack>
        </Grid>
      </Grid>

      {/* Architectural notes */}
      <Box
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: isDark
            ? 'rgba(139,92,246,0.20)'
            : 'rgba(139,92,246,0.15)',
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(17,24,39,0.40)' : 'rgba(249,250,251,0.80)',
        }}
      >
        <Stack spacing={2}>
          <Typography
            variant="h6"
            sx={{
              fontSize: 16,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            }}
          >
            Layout Architecture
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 14,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Both layout modes use an internal <code>FieldLayoutShell</code>{' '}
            component to manage label and helper text positioning. The shell
            renders labels and helper text externally (outside MUI TextField)
            while preserving all Dashforge capabilities (form integration,
            validation, conditional visibility, etc.).
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 14,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Spacing values are defined in the theme's <code>fieldLayout</code>{' '}
            configuration, ensuring consistency across all form-connected
            components (TextField, Select, Autocomplete, etc.).
          </Typography>
        </Stack>
      </Box>

      {/* Error state comparison */}
      <Stack spacing={2}>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Layout with Error State
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DocsPreviewBlock
              code={`<TextField
  label="Email"
  name="email"
  error
  helperText="Invalid email format"
  fullWidth
/>`}
            >
              <TextField
                label="Email"
                name="email"
                error
                helperText="Invalid email format"
                fullWidth
              />
            </DocsPreviewBlock>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DocsPreviewBlock
              minHeight={160}
              code={`<TextField
  label="Email"
  name="email"
  layout="inline"
  error
  helperText="Invalid email format"
  fullWidth
/>`}
            >
              <TextField
                label="Email"
                name="email"
                layout="inline"
                error
                helperText="Invalid email format"
                fullWidth
              />
            </DocsPreviewBlock>
          </Grid>
        </Grid>
        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(15,23,42,0.60)',
          }}
        >
          <strong>What to observe:</strong> Error states work identically in
          both layouts. Labels turn red and helper text displays error messages
          with appropriate styling.
        </Typography>
      </Stack>
    </Stack>
  );
}
