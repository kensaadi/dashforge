import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * AutocompleteApi documents the component's API surface
 */
export function AutocompleteApi() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const apiRows = [
    {
      prop: 'name',
      type: 'string',
      default: 'required',
      description: 'Field name for form registration',
    },
    {
      prop: 'label',
      type: 'React.ReactNode',
      default: '-',
      description: 'Input label text',
    },
    {
      prop: 'options',
      type: 'TOption[]',
      default: 'required',
      description: 'Array of available options',
    },
    {
      prop: 'value',
      type: 'TValue | null',
      default: '-',
      description: 'Controlled value (explicit override)',
    },
    {
      prop: 'onChange',
      type: '(value: TValue | null) => void',
      default: '-',
      description: 'Change handler',
    },
    {
      prop: 'getOptionValue',
      type: '(option: TOption) => TValue',
      default: 'identity',
      description: 'Extract unique value from option',
    },
    {
      prop: 'getOptionLabel',
      type: '(option: TOption) => string',
      default: 'identity',
      description: 'Extract display label from option',
    },
    {
      prop: 'getOptionDisabled',
      type: '(option: TOption) => boolean',
      default: '-',
      description: 'Determine if option is disabled',
    },
    {
      prop: 'optionsFromFieldData',
      type: 'boolean',
      default: 'false',
      description: 'Load options from field runtime data (Reactive V2)',
    },
    {
      prop: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable entire input',
    },
    {
      prop: 'error',
      type: 'boolean',
      default: '-',
      description: 'Error state (explicit override)',
    },
    {
      prop: 'helperText',
      type: 'React.ReactNode',
      default: '-',
      description: 'Helper/error text (explicit override)',
    },
    {
      prop: 'rules',
      type: 'unknown',
      default: '-',
      description: 'Validation rules (DashForm)',
    },
    {
      prop: 'visibleWhen',
      type: '(engine: Engine) => boolean',
      default: '-',
      description: 'Conditional visibility function',
    },
    {
      prop: 'onBlur',
      type: '(event: FocusEvent) => void',
      default: '-',
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

      <Paper
        sx={{
          overflow: 'hidden',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.01)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid rgba(15,23,42,0.08)',
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.90)'
                      : 'rgba(15,23,42,0.90)',
                    bgcolor: isDark
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Prop
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.90)'
                      : 'rgba(15,23,42,0.90)',
                    bgcolor: isDark
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.90)'
                      : 'rgba(15,23,42,0.90)',
                    bgcolor: isDark
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Default
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.90)'
                      : 'rgba(15,23,42,0.90)',
                    bgcolor: isDark
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Description
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apiRows.map((row) => (
                <TableRow key={row.prop}>
                  <TableCell
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 13,
                      color: isDark
                        ? 'rgba(255,255,255,0.90)'
                        : 'rgba(15,23,42,0.90)',
                    }}
                  >
                    {row.prop}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: isDark
                        ? 'rgba(255,255,255,0.70)'
                        : 'rgba(15,23,42,0.70)',
                    }}
                  >
                    {row.type}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: isDark
                        ? 'rgba(255,255,255,0.60)'
                        : 'rgba(15,23,42,0.60)',
                    }}
                  >
                    {row.default}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: 13,
                      color: isDark
                        ? 'rgba(255,255,255,0.70)'
                        : 'rgba(15,23,42,0.70)',
                    }}
                  >
                    {row.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

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
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(0,0,0,0.08)',
            borderRadius: 1,
            overflow: 'auto',
            fontSize: 13,
            fontFamily: 'monospace',
            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
          }}
        >
          {`function Autocomplete<
  TValue extends string | number = string,
  TOption = AutocompleteOption
>(props: AutocompleteProps<TValue, TOption>): JSX.Element`}
        </Box>
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
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(0,0,0,0.08)',
            borderRadius: 1,
            overflow: 'auto',
            fontSize: 13,
            fontFamily: 'monospace',
            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
          }}
        >
          {`interface Country {
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
        </Box>
      </Box>
    </Stack>
  );
}
