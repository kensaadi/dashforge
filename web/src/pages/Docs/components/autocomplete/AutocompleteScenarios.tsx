import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { AutocompleteFormDemo } from './demos/AutocompleteFormDemo';
import { AutocompleteRuntimeDemo } from './demos/AutocompleteRuntimeDemo';

/**
 * AutocompleteScenarios shows real-world use cases
 */
export function AutocompleteScenarios() {
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
        Common real-world scenarios showing Autocomplete in context.
      </Typography>

      <Box>
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
              Form Validation
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
              Integrate with DashForm for validation, error handling, and form
              submission. Shows required fields and custom validation rules.
            </Typography>
          </Box>
          <DocsPreviewBlock
            code={`<DashForm onSubmit={handleSubmit}>
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
</DashForm>`}
          >
            <AutocompleteFormDemo />
          </DocsPreviewBlock>
        </Stack>
      </Box>

      <Box>
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
              Runtime Dependent Options
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
              Options that change based on another field's value. Uses
              optionsFromFieldData to load options from runtime state. Note: The
              dependent field value is NOT reset when options change (Reactive
              V2 policy).
            </Typography>
          </Box>
          <DocsPreviewBlock
            badge="Reactive V2"
            code={`<DashForm
  reactions={[
    {
      id: 'update-subcategory-options',
      watch: ['category'],
      run: ({ getValue, setRuntime }) => {
        const category = getValue('category');
        const subcategories = getSubcategoriesForCategory(category);
        setRuntime('subcategory', {
          status: 'ready',
          data: { options: subcategories },
        });
      },
    },
  ]}
>
  <Autocomplete name="category" label="Category" options={categories} />
  <Autocomplete
    name="subcategory"
    label="Subcategory"
    options={[]}
    optionsFromFieldData
  />
</DashForm>`}
          >
            <AutocompleteRuntimeDemo />
          </DocsPreviewBlock>
        </Stack>
      </Box>
    </Stack>
  );
}
