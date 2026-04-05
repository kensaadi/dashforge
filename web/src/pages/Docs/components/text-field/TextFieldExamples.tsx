import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TextField } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * TextFieldExamples displays interactive TextField examples
 * Each example shows both the rendered component and its code
 */
export function TextFieldExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'Basic',
      description: 'A simple text field with a label',
      code: `<TextField label="Name" name="name" />`,
      component: <TextField label="Name" name="name" />,
    },
    {
      title: 'Disabled',
      description: 'A disabled text field',
      code: `<TextField label="Name" name="name" disabled />`,
      component: <TextField label="Name" name="name" disabled />,
    },
    {
      title: 'Error State',
      description: 'A text field displaying an error',
      code: `<TextField
  label="Email"
  name="email"
  error
  helperText="Invalid email"
/>`,
      component: (
        <TextField
          variant="outlined"
          label="Email"
          name="email"
          error
          helperText="Invalid email"
        />
      ),
    },
    {
      title: 'Full Width',
      description: 'A text field that spans the full width',
      code: `<TextField
  label="Address"
  name="address"
  fullWidth
/>`,
      component: <TextField label="Address" name="address" fullWidth />,
    },
    {
      title: 'Inline Layout',
      description: 'A text field with label on the left',
      code: `<TextField
  label="Email"
  name="email"
  layout="inline"
  fullWidth
/>`,
      component: (
        <TextField label="Email" name="email" layout="inline" fullWidth />
      ),
    },
    {
      title: 'Inline with Helper Text',
      description: 'Inline layout with helper text below control',
      code: `<TextField
  label="Username"
  name="username"
  layout="inline"
  helperText="Must be unique"
  fullWidth
/>`,
      component: (
        <TextField
          label="Username"
          name="username"
          layout="inline"
          helperText="Must be unique"
          fullWidth
        />
      ),
    },
    {
      title: 'Multiline',
      description: 'A text field with multiple lines',
      code: `<TextField
  label="Description"
  name="description"
  multiline
  rows={4}
/>`,
      component: (
        <TextField
          label="Description"
          name="description"
          multiline
          rows={4}
          fullWidth
        />
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, minmax(0, 1fr))',
        },
        gap: 3,
      }}
    >
      {examples.map((example) => (
        <Box
          key={example.title}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            {/* Compact Header */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.25,
                  lineHeight: 1.3,
                }}
              >
                {example.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: isDark
                    ? 'rgba(255,255,255,0.60)'
                    : 'rgba(15,23,42,0.60)',
                }}
              >
                {example.description}
              </Typography>
            </Box>

            {/* Preview Block with Compact Mode */}
            <DocsPreviewBlock code={example.code} badge="" compact>
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
