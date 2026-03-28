import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsApiTable, type ApiPropDefinition } from '../shared';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * AutocompleteApi documents the component's API surface
 */
export function AutocompleteApi() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const apiRows: ApiPropDefinition[] = [
    {
      name: 'name',
      type: 'string',
      defaultValue: 'required',
      description: 'Field name for form registration',
    },
    {
      name: 'label',
      type: 'React.ReactNode',
      defaultValue: '-',
      description: 'Input label text',
    },
    {
      name: 'options',
      type: 'TOption[]',
      defaultValue: 'required',
      description: 'Array of available options',
    },
    {
      name: 'value',
      type: 'TValue | null',
      defaultValue: '-',
      description: 'Controlled value (explicit override)',
    },
    {
      name: 'onChange',
      type: '(value: TValue | null) => void',
      defaultValue: '-',
      description: 'Change handler',
    },
    {
      name: 'getOptionValue',
      type: '(option: TOption) => TValue',
      defaultValue: 'identity',
      description: 'Extract unique value from option',
    },
    {
      name: 'getOptionLabel',
      type: '(option: TOption) => string',
      defaultValue: 'identity',
      description: 'Extract display label from option',
    },
    {
      name: 'getOptionDisabled',
      type: '(option: TOption) => boolean',
      defaultValue: '-',
      description: 'Determine if option is disabled',
    },
    {
      name: 'optionsFromFieldData',
      type: 'boolean',
      defaultValue: 'false',
      description: 'Load options from field runtime data (Reactive V2)',
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: 'false',
      description: 'Disable entire input',
    },
    {
      name: 'error',
      type: 'boolean',
      defaultValue: '-',
      description: 'Error state (explicit override)',
    },
    {
      name: 'helperText',
      type: 'React.ReactNode',
      defaultValue: '-',
      description: 'Helper/error text (explicit override)',
    },
    {
      name: 'rules',
      type: 'unknown',
      defaultValue: '-',
      description: 'Validation rules (DashForm)',
    },
    {
      name: 'visibleWhen',
      type: '(engine: Engine) => boolean',
      defaultValue: '-',
      description: 'Conditional visibility function',
    },
    {
      name: 'onBlur',
      type: '(event: FocusEvent) => void',
      defaultValue: '-',
      description: 'Additional blur handler',
    },
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
        Complete API reference for Autocomplete component props.
      </Typography>

      <DocsApiTable props={apiRows} />

      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            mb: 2,
          }}
        >
          Generic Type Signature
        </Typography>
        <DocsCodeBlock
          code={`function Autocomplete<
  TValue extends string | number = string,
  TOption = AutocompleteOption
>(props: AutocompleteProps<TValue, TOption>): JSX.Element`}
          language="typescript"
        />
      </Box>

      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            mb: 2,
          }}
        >
          Generic Usage Example
        </Typography>
        <DocsCodeBlock
          code={`interface Country {
  code: string;
  name: string;
  disabled?: boolean;
}

<Autocomplete<string, Country>
  name="country"
  label="Country"
  options={countries}
  getOptionLabel={(option) => option.name}
  getOptionValue={(option) => option.code}
  getOptionDisabled={(option) => option.disabled ?? false}
/>`}
          language="tsx"
        />
      </Box>
    </Stack>
  );
}
