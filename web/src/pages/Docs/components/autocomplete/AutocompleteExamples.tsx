import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { AutocompleteBasicDemo } from './demos/AutocompleteBasicDemo';
import { AutocompleteFreeSoloDemo } from './demos/AutocompleteFreeSoloDemo';
import { AutocompleteGenericDemo } from './demos/AutocompleteGenericDemo';
import { AutocompleteFormDemo } from './demos/AutocompleteFormDemo';
import { AutocompleteDisabledOptionsDemo } from './demos/AutocompleteDisabledOptionsDemo';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * AutocompleteExamples displays curated Autocomplete examples
 */
export function AutocompleteExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'Basic Static Options',
      description: 'Simple autocomplete with predefined choices',
      code: `<Autocomplete
  name="country"
  label="Country"
  options={countries}
  value={value}
  onChange={setValue}
/>`,
      component: <AutocompleteBasicDemo />,
    },
    {
      title: 'FreeSolo Behavior',
      description: 'Custom values or selection from options',
      code: `<Autocomplete
  name="favoriteColor"
  label="Favorite Color"
  options={colors}
  value={value}
  onChange={setValue}
/>`,
      component: <AutocompleteFreeSoloDemo />,
    },
    {
      title: 'Generic Options with Mappers',
      description: 'Type-safe object arrays with custom mappers',
      code: `<Autocomplete<string, Country>
  name="country"
  label="Country"
  options={countries}
  value={value}
  onChange={setValue}
  getOptionValue={(option) => option.code}
  getOptionLabel={(option) => option.name}
/>`,
      component: <AutocompleteGenericDemo />,
    },
    {
      title: 'DashForm Integration',
      description: 'Form validation and error handling',
      code: `<DashForm onSubmit={handleSubmit}>
  <Autocomplete
    name="country"
    label="Country"
    options={countries}
    rules={{ required: 'Country is required' }}
  />
  <Autocomplete
    name="city"
    label="City"
    options={cities}
    rules={{
      required: 'City is required',
      validate: (value) => {
        if (value && value.length < 3) {
          return 'City must be at least 3 characters';
        }
        return true;
      },
    }}
  />
  <Button type="submit">Submit</Button>
</DashForm>`,
      component: <AutocompleteFormDemo />,
    },
    {
      title: 'Disabled Options',
      description: 'Prevent selection of unavailable choices',
      code: `<Autocomplete<string, Product>
  name="product"
  label="Product"
  options={products}
  getOptionValue={(option) => option.id}
  getOptionLabel={(option) => option.name}
  getOptionDisabled={(option) => !option.inStock}
/>`,
      component: <AutocompleteDisabledOptionsDemo />,
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
  );
}
