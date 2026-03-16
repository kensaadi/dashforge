import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useDashTheme } from '@dashforge/theme-core';

interface PropDefinition {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

const props: PropDefinition[] = [
  {
    name: 'name',
    type: 'string',
    description: 'Field name for form integration (required)',
  },
  {
    name: 'label',
    type: 'string',
    description: 'Label text displayed above the input',
  },
  {
    name: 'value',
    type: 'number | string | null',
    description: 'Controlled value of the input',
  },
  {
    name: 'onChange',
    type: '(event) => void',
    description: 'Callback fired when the value changes',
  },
  {
    name: 'error',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the input displays an error state',
  },
  {
    name: 'helperText',
    type: 'string',
    description: 'Helper text displayed below the input',
  },
  {
    name: 'disabled',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the input is disabled',
  },
  {
    name: 'required',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the input is marked as required',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the input takes up the full width of its container',
  },
  {
    name: 'placeholder',
    type: 'string',
    description: 'Placeholder text when input is empty',
  },
  {
    name: 'inputProps',
    type: 'object',
    description: 'Attributes for the input element (min, max, step)',
  },
  {
    name: 'variant',
    type: "'outlined' | 'filled' | 'standard'",
    defaultValue: 'outlined',
    description: 'MUI TextField variant for visual styling',
  },
  {
    name: 'rules',
    type: 'ValidationRules',
    description: 'Validation rules for form integration',
  },
  {
    name: 'visibleWhen',
    type: '(engine) => boolean',
    description: 'Conditional visibility function for reactive forms',
  },
];

/**
 * NumberFieldApi displays the props table for NumberField component
 */
export function NumberFieldApi() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <TableContainer
      component={Paper}
      sx={{
        bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 700,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                borderBottom: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
              Prop
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                borderBottom: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
              Type
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                borderBottom: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
              Default
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                borderBottom: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
              Description
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.map((prop) => (
            <TableRow key={prop.name}>
              <TableCell
                sx={{
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: isDark
                    ? 'rgba(255,255,255,0.85)'
                    : 'rgba(15,23,42,0.85)',
                  borderBottom: isDark
                    ? '1px solid rgba(255,255,255,0.05)'
                    : '1px solid rgba(15,23,42,0.05)',
                }}
              >
                {prop.name}
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                  borderBottom: isDark
                    ? '1px solid rgba(255,255,255,0.05)'
                    : '1px solid rgba(15,23,42,0.05)',
                }}
              >
                {prop.type}
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: isDark
                    ? 'rgba(255,255,255,0.65)'
                    : 'rgba(15,23,42,0.65)',
                  borderBottom: isDark
                    ? '1px solid rgba(255,255,255,0.05)'
                    : '1px solid rgba(15,23,42,0.05)',
                }}
              >
                {prop.defaultValue || '-'}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: 13,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                  borderBottom: isDark
                    ? '1px solid rgba(255,255,255,0.05)'
                    : '1px solid rgba(15,23,42,0.05)',
                }}
              >
                {prop.description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
