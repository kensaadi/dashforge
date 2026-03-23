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
    name: 'options',
    type: 'SelectOption[]',
    description:
      'Array of static options with value and label. When optionsFromFieldData is provided, runtime options take precedence over static options for rendering.',
  },
  {
    name: 'optionsFromFieldData',
    type: 'string',
    description:
      'Runtime field name to load options from. When provided, options are loaded from the field runtime state (Reactive V2) instead of the static options prop. Enables async/reactive option loading through reactions.',
  },
  {
    name: 'getOptionValue',
    type: '(option: T) => string | number',
    defaultValue: '(opt) => opt.value',
    description:
      'Extracts the value from each option object. Use when option shape differs from the default {value, label} structure. Required when using generic option shapes with optionsFromFieldData.',
  },
  {
    name: 'getOptionLabel',
    type: '(option: T) => string',
    defaultValue: '(opt) => opt.label',
    description:
      'Extracts the display label from each option object. Use when option shape differs from the default {value, label} structure. Required when using generic option shapes with optionsFromFieldData.',
  },
  {
    name: 'getOptionDisabled',
    type: '(option: T) => boolean',
    defaultValue: '(opt) => false',
    description:
      'Determines if an option should be disabled. Optional mapper function that works with both static options and runtime options.',
  },
  {
    name: 'label',
    type: 'string',
    description: 'Label text displayed above or beside the select',
  },
  {
    name: 'value',
    type: 'string | number',
    description: 'Controlled value of the select',
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
    description: 'If true, the select displays an error state',
  },
  {
    name: 'helperText',
    type: 'string',
    description: 'Helper text displayed below the select',
  },
  {
    name: 'disabled',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the select is disabled',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the select takes up the full width of its container',
  },
  {
    name: 'placeholder',
    type: 'string',
    description: 'Placeholder text shown when no value is selected',
  },
  {
    name: 'variant',
    type: "'outlined' | 'filled' | 'standard'",
    defaultValue: "'outlined'",
    description: 'Visual style variant of the select field',
  },
  {
    name: 'layout',
    type: "'floating' | 'stacked' | 'inline'",
    defaultValue: "'floating'",
    description:
      'Label positioning mode (floating, stacked above, or inline beside)',
  },
  {
    name: 'rules',
    type: 'ValidationRules',
    description: 'Validation rules for form integration',
  },
  {
    name: 'visibleWhen',
    type: '(engine: Engine) => boolean',
    description:
      'Conditional visibility predicate. When false, component renders null. Receives engine instance with access to all field state via getNode(name). Re-evaluates on dependency changes.',
  },
];

/**
 * SelectApi displays the props table for Select component
 */
export function SelectApi() {
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
          <TableRow
            sx={{
              bgcolor: isDark
                ? 'rgba(139,92,246,0.08)'
                : 'rgba(139,92,246,0.04)',
            }}
          >
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
                py: 1.5,
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
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
                py: 1.5,
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
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
                py: 1.5,
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
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
                py: 1.5,
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
            <TableRow
              key={prop.name}
              sx={{
                '&:last-child td': { borderBottom: 0 },
                '&:hover': {
                  bgcolor: isDark
                    ? 'rgba(139,92,246,0.04)'
                    : 'rgba(139,92,246,0.02)',
                },
              }}
            >
              <TableCell
                sx={{
                  fontFamily: '"Fira Code", "SF Mono", Menlo, monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(139,92,246,0.95)'
                    : 'rgba(109,40,217,0.95)',
                  py: 2,
                  borderBottom: isDark
                    ? '1px solid rgba(255,255,255,0.06)'
                    : '1px solid rgba(15,23,42,0.06)',
                }}
              >
                {prop.name}
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: '"Fira Code", "SF Mono", Menlo, monospace',
                  fontSize: 12,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                  py: 2,
                  borderBottom: isDark
                    ? '1px solid rgba(255,255,255,0.06)'
                    : '1px solid rgba(15,23,42,0.06)',
                }}
              >
                {prop.type}
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: '"Fira Code", "SF Mono", Menlo, monospace',
                  fontSize: 12,
                  color: isDark
                    ? 'rgba(255,255,255,0.60)'
                    : 'rgba(15,23,42,0.60)',
                  py: 2,
                  borderBottom: isDark
                    ? '1px solid rgba(255,255,255,0.06)'
                    : '1px solid rgba(15,23,42,0.06)',
                }}
              >
                {prop.defaultValue || '—'}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                  py: 2,
                  borderBottom: isDark
                    ? '1px solid rgba(255,255,255,0.06)'
                    : '1px solid rgba(15,23,42,0.06)',
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
