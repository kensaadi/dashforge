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
        TextField supports three layout modes: <code>floating</code> (default),{' '}
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
                code={`<TextField
  label="Email"
  name="email"
  placeholder="Enter your email"
  helperText="We will never share your email."
  layout="stacked"
  fullWidth
/>`}
              >
                <TextField
                  label="Email"
                  name="email"
                  placeholder="Enter your email"
                  helperText="We will never share your email."
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
              <strong>What to observe:</strong> External label above input
              field. Label is always visible and stationary. Helper text appears
              below the input.
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
                  helperText="We will never share your email."
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
              <strong>What to observe:</strong> External label to the left of
              input field, aligned to the top. Helper text appears below the
              input. Useful for compact horizontal forms.
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
            <strong>Floating layout (default):</strong> Uses standard MUI
            TextField composition with internal floating label. This preserves
            the familiar MUI behavior and ensures easy migration.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 14,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            <strong>Custom layouts (stacked/inline):</strong> Use an internal{' '}
            <code>FieldLayoutShell</code> component to manage external label and
            helper text positioning. The shell renders labels and helper text
            outside MUI TextField while preserving all Dashforge capabilities
            (form integration, validation, conditional visibility, etc.).
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 14,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Spacing values for custom layouts are defined in the theme's{' '}
            <code>fieldLayout</code> configuration, ensuring consistency across
            all form-connected components (TextField, Select, Autocomplete,
            etc.).
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
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DocsPreviewBlock
              minHeight={200}
              centerContent
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
          <Grid size={{ xs: 12, md: 4 }}>
            <DocsPreviewBlock
              minHeight={200}
              centerContent
              code={`<TextField
  label="Email"
  name="email"
  layout="stacked"
  error
  helperText="Invalid email format"
  fullWidth
/>`}
            >
              <TextField
                label="Email"
                name="email"
                layout="stacked"
                error
                helperText="Invalid email format"
                fullWidth
              />
            </DocsPreviewBlock>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DocsPreviewBlock
              minHeight={200}
              centerContent
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
          <strong>What to observe:</strong> Error states work identically across
          all layouts. Labels turn red and helper text displays error messages
          with appropriate styling.
        </Typography>
      </Stack>
    </Stack>
  );
}
