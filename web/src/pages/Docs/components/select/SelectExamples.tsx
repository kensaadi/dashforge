import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Select } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';
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
  const [country, setCountry] = useState<string>('');

  const examples: Example[] = [
    {
      title: 'Basic',
      description: 'Single selection from a list of options',
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
          value={country}
          onChange={(event) => {
            const { value } = event.target;
            setCountry(value);
          }}
          options={[
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
            { value: 'mx', label: 'Mexico' },
          ]}
          fullWidth
        />
      ),
    },
    {
      title: 'Disabled',
      description: 'Prevent user interaction when read-only',
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
          fullWidth
        />
      ),
    },
    {
      title: 'Error State',
      description: 'Validation feedback for required selections',
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
          fullWidth
        />
      ),
    },
    {
      title: 'Full Width',
      description: 'Expand to fill available container width',
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
      description: 'Dropdown with extensive option lists',
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
          fullWidth
        />
      ),
    },
    {
      title: 'With Placeholder',
      description: 'Guide users before they make a selection',
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
          fullWidth
        />
      ),
    },
  ];

  // Runtime/Reactive V2 Examples with DashForm
  interface Department {
    id: string;
    name: string;
    active: boolean;
  }

  const RuntimeExample1 = () => {
    return (
      <DashForm
        defaultValues={{ department: '' }}
        reactions={[
          {
            id: 'load-departments',
            watch: [],
            run: async (ctx) => {
              ctx.setRuntime('department', { status: 'loading' });
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 500));
              ctx.setRuntime('department', {
                status: 'ready',
                data: {
                  options: [
                    { id: 'eng', name: 'Engineering', active: true },
                    { id: 'sales', name: 'Sales', active: true },
                    { id: 'support', name: 'Support', active: false },
                  ],
                },
              });
            },
          },
        ]}
      >
        <Select
          name="department"
          label="Department"
          fullWidth
          optionsFromFieldData
          getOptionValue={(opt) => (opt as Department).id}
          getOptionLabel={(opt) => (opt as Department).name}
          getOptionDisabled={(opt) => !(opt as Department).active}
        />
      </DashForm>
    );
  };

  const runtimeExamples: Example[] = [
    {
      title: 'Runtime-Driven Options',
      description:
        'Load options from runtime state via Reactive V2. This example loads department options with a simulated async call and disables inactive options.',
      code: `<DashForm
  defaultValues={{ department: '' }}
  reactions={[
    {
      id: 'load-departments',
      watch: [],
      run: async (ctx) => {
        ctx.setRuntime('department', { status: 'loading' });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        ctx.setRuntime('department', {
          status: 'ready',
          data: {
            options: [
              { id: 'eng', name: 'Engineering', active: true },
              { id: 'sales', name: 'Sales', active: true },
              { id: 'support', name: 'Support', active: false }
            ]
          }
        });
      }
    }
  ]}
>
  <Select
    name="department"
    label="Department"
    fullWidth
    optionsFromFieldData="department"
    getOptionValue={(opt) => opt.id}
    getOptionLabel={(opt) => opt.name}
    getOptionDisabled={(opt) => !opt.active}
  />
</DashForm>`,
      component: <RuntimeExample1 />,
    },
  ];

  return (
    <Stack spacing={4}>
      {/* Static Examples Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {examples.map((example) => (
          <Box
            key={example.title}
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack spacing={1.5}>
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

      {/* Reactive V2 Examples Section */}
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            mb: 1,
          }}
        >
          Reactive V2 Examples
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            mb: 3,
          }}
        >
          These examples demonstrate runtime-driven options through Reactive V2.
          Options are loaded dynamically via reactions, supporting async data
          fetching and generic option shapes.
        </Typography>

        <Stack spacing={2.5}>
          {runtimeExamples.map((example) => (
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

                <DocsPreviewBlock code={example.code} badge="Reactive V2">
                  {example.component}
                </DocsPreviewBlock>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
