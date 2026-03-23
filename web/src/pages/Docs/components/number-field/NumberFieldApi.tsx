import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
    type: 'number | null',
    description:
      'Controlled value (number | null). Empty input normalizes to null. Never NaN.',
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
    description:
      'If true, displays error state. Explicit prop overrides form-provided error state.',
  },
  {
    name: 'helperText',
    type: 'string',
    description:
      'Helper text below input. Explicit prop overrides form-provided error messages.',
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
    description:
      'Validation rules for DashForm integration (required, min, max, custom validators)',
  },
  {
    name: 'visibleWhen',
    type: '(engine) => boolean',
    description:
      'Predicate for conditional rendering. Component evaluates on engine state changes. Returns null when false.',
  },
];

/**
 * NumberFieldApi displays the props table for NumberField component
 */
export function NumberFieldApi() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={3}>
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

      {/* Explicit vs Form-Provided Props Note */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: 1.5,
          bgcolor: isDark
            ? 'rgba(139,92,246,0.08)'
            : 'rgba(139,92,246,0.05)',
          border: isDark
            ? '1px solid rgba(139,92,246,0.20)'
            : '1px solid rgba(139,92,246,0.15)',
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: isDark
              ? 'rgba(139,92,246,0.90)'
              : 'rgba(109,40,217,0.95)',
            mb: 1,
          }}
        >
          Explicit vs Form-Provided Props
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          }}
        >
          When NumberField is used inside DashForm, values are automatically
          bound from the form context. You can explicitly pass{' '}
          <code>error</code>, <code>helperText</code>, <code>value</code>, or{' '}
          <code>onChange</code> to override form-provided behavior.
        </Typography>
      </Box>
    </Stack>
  );
}
