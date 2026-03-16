import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Select } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * SelectExamples displays interactive Select examples
 * Each example shows both the rendered component and its code
 */
export function SelectExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'Basic',
      description: 'A simple select field with a label',
      code: `<Select
  label="Country"
  name="country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
  ]}
/>`,
      component: (
        <Select
          label="Country"
          name="country"
          options={[
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
            { value: 'mx', label: 'Mexico' },
          ]}
        />
      ),
    },
    {
      title: 'Disabled',
      description: 'A disabled select field',
      code: `<Select
  label="Country"
  name="country"
  disabled
  options={[
    { value: 'us', label: 'United States' },
  ]}
/>`,
      component: (
        <Select
          label="Country"
          name="country"
          disabled
          options={[{ value: 'us', label: 'United States' }]}
        />
      ),
    },
    {
      title: 'Error State',
      description: 'A select field displaying an error',
      code: `<Select
  label="Country"
  name="country"
  error
  helperText="Please select a country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
  ]}
/>`,
      component: (
        <Select
          label="Country"
          name="country"
          error
          helperText="Please select a country"
          options={[
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
          ]}
        />
      ),
    },
    {
      title: 'Full Width',
      description: 'A select field that spans the full width',
      code: `<Select
  label="Country"
  name="country"
  fullWidth
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
  ]}
/>`,
      component: (
        <Select
          label="Country"
          name="country"
          fullWidth
          options={[
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
            { value: 'mx', label: 'Mexico' },
          ]}
        />
      ),
    },
    {
      title: 'Multiple Options',
      description: 'A select field with many options',
      code: `<Select
  label="State"
  name="state"
  options={[
    { value: 'ny', label: 'New York' },
    { value: 'ca', label: 'California' },
    { value: 'tx', label: 'Texas' },
    { value: 'fl', label: 'Florida' },
    { value: 'il', label: 'Illinois' },
  ]}
/>`,
      component: (
        <Select
          label="State"
          name="state"
          options={[
            { value: 'ny', label: 'New York' },
            { value: 'ca', label: 'California' },
            { value: 'tx', label: 'Texas' },
            { value: 'fl', label: 'Florida' },
            { value: 'il', label: 'Illinois' },
          ]}
        />
      ),
    },
    {
      title: 'With Placeholder',
      description: 'A select field with placeholder text',
      code: `<Select
  label="Country"
  name="country"
  placeholder="Choose a country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
  ]}
/>`,
      component: (
        <Select
          label="Country"
          name="country"
          placeholder="Choose a country"
          options={[
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
            { value: 'mx', label: 'Mexico' },
          ]}
        />
      ),
    },
  ];

  return (
    <Stack spacing={2.5}>
      {examples.map((example) => (
        <Box key={example.title}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 16,
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
