import { useState } from 'react';
import MuiTextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';
import { Autocomplete } from '@dashforge/ui';
import { DocsPlayground } from '../playground/DocsPlayground';

const countries = [
  'United States',
  'Canada',
  'Mexico',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'Australia',
  'Brazil',
  'India',
];

/**
 * AutocompletePlayground provides an interactive playground
 */
export function AutocompletePlayground() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const [label, setLabel] = useState('Country');
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');

  const generateCode = () => {
    const props: string[] = ['name="country"'];

    if (label) props.push(`label="${label}"`);
    if (disabled) props.push('disabled');
    if (error) props.push('error');
    if (helperText) props.push(`helperText="${helperText}"`);

    props.push('options={countries}');

    return `<Autocomplete\n  ${props.join('\n  ')}\n/>`;
  };

  const controls = (
    <Stack spacing={2.5}>
      <MuiTextField
        label="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        size="small"
        fullWidth
      />

      <MuiTextField
        label="Helper Text"
        value={helperText}
        onChange={(e) => setHelperText(e.target.value)}
        size="small"
        fullWidth
      />

      <Box>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)',
            mb: 1.5,
          }}
        >
          State
        </Typography>
        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Switch
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
                size="small"
              />
            }
            label="Disabled"
          />
          <FormControlLabel
            control={
              <Switch
                checked={error}
                onChange={(e) => setError(e.target.checked)}
                size="small"
              />
            }
            label="Error"
          />
        </Stack>
      </Box>
    </Stack>
  );

  const preview = (
    <Autocomplete
      name="country"
      label={label}
      options={countries}
      disabled={disabled}
      error={error}
      helperText={helperText || undefined}
    />
  );

  return (
    <DocsPlayground
      code={generateCode()}
      controls={controls}
      preview={preview}
    />
  );
}
