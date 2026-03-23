import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
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
    type: 'string',
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
    description:
      'If true, displays error state. Explicit error prop overrides form-provided error state. When inside DashForm without explicit prop, error is gated (shows only when touched OR submitted).',
  },
  {
    name: 'helperText',
    type: 'string',
    description:
      'Helper text displayed below input. Explicit helperText prop overrides form-provided validation error message. When inside DashForm, validation errors display as helperText (gated by touched/submitted state).',
  },
  {
    name: 'disabled',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the input is disabled',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the input takes up the full width of its container',
  },
  {
    name: 'multiline',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the input becomes a textarea',
  },
  {
    name: 'rows',
    type: 'number',
    description: 'Number of rows to display when multiline is true',
  },
  {
    name: 'layout',
    type: "'floating' | 'stacked' | 'inline'",
    defaultValue: "'floating'",
    description:
      'Field layout mode. floating: standard MUI floating label (internal). stacked: external label above control. inline: external label to left of control. Layout is architectural, not just styling.',
  },
  {
    name: 'rules',
    type: 'ValidationRules',
    description:
      'Validation rules for DashForm integration. Format follows React Hook Form rules contract. Only used when inside DashForm—ignored in standalone mode.',
  },
  {
    name: 'visibleWhen',
    type: '(engine: Engine) => boolean',
    description:
      'Component-level conditional rendering predicate. Receives engine instance with access to all field state via getNode(name). When false, component renders null. Re-evaluates on dependency changes. Only works inside DashForm (requires engine).',
  },
];

/**
 * TextFieldApi displays the props table for TextField component
 */
export function TextFieldApi() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={2}>
      <Typography
        variant="body2"
        sx={{
          fontSize: 14,
          lineHeight: 1.6,
          color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
        }}
      >
        <strong>Explicit vs Auto-Bound Props:</strong> When inside DashForm,
        TextField receives value, error, helperText, onChange, and onBlur
        automatically through field binding. Explicit props always take
        precedence over form-provided values.
      </Typography>
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
    </Stack>
  );
}
