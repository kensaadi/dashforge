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
    <Stack spacing={4}>
      {examples.map((example) => (
        <Box key={example.title}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.5,
                }}
              >
                {example.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  color: isDark
                    ? 'rgba(255,255,255,0.65)'
                    : 'rgba(15,23,42,0.65)',
                }}
              >
                {example.description}
              </Typography>
            </Box>

            <DocsPreviewBlock code={example.code} badge="">
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
