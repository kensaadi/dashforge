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
      description:
        'Simple Autocomplete with static string array options. Always in freeSolo mode, allowing custom text entry.',
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
      description:
        'Type custom values or select from options. FreeSolo is always enabled in DashAutocomplete.',
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
      description:
        'Use object arrays with getOptionValue and getOptionLabel for type-safe mapping.',
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
      description:
        'Integrate with DashForm for validation, error handling, and form submission.',
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
      description:
        'Disable specific options using getOptionDisabled. Useful for showing unavailable choices.',
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
    <Stack spacing={4}>
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
            <DocsPreviewBlock code={example.code}>
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
