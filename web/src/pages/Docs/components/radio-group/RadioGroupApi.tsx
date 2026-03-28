import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsApiTable, type ApiPropDefinition } from '../shared';

const props: ApiPropDefinition[] = [
  {
    name: 'name',
    type: 'string',
    description: 'Field name for form integration (required)',
  },
  {
    name: 'options',
    type: 'RadioGroupOption[]',
    description:
      'Array of radio options. Each option has: { value: string, label: React.ReactNode, disabled?: boolean }. Required prop that defines available choices.',
  },
  {
    name: 'label',
    type: 'React.ReactNode',
    description:
      'Label text displayed above the radio group. When provided, wraps the group in FormLabel.',
  },
  {
    name: 'value',
    type: 'string',
    description: 'Controlled selected value of the radio group',
  },
  {
    name: 'onChange',
    type: '(event, value) => void',
    description:
      'Callback fired when the selected value changes. Receives both the event and the new value.',
  },
  {
    name: 'row',
    type: 'boolean',
    defaultValue: 'false',
    description:
      'If true, displays radio buttons horizontally. Default is vertical layout.',
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
      'Helper text displayed below radio group. Explicit helperText prop overrides form-provided validation error message. When inside DashForm, validation errors display as helperText (gated by touched/submitted state).',
  },
  {
    name: 'rules',
    type: 'ValidationRules',
    description:
      'Validation rules for DashForm integration. Format follows React Hook Form rules contract. Only used when inside DashForm—ignored in standalone mode. Common rule: { required: "message" } for mandatory selection.',
  },
  {
    name: 'visibleWhen',
    type: '(engine: Engine) => boolean',
    description:
      'Component-level conditional rendering predicate. Receives engine instance with access to all field state via getNode(name). When false, component renders null. Re-evaluates on dependency changes. Only works inside DashForm (requires engine).',
  },
];

/**
 * RadioGroupApi displays the props table for RadioGroup component
 */
export function RadioGroupApi() {
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
        RadioGroup receives value, error, helperText, onChange, and onBlur
        automatically through field binding. Explicit props always take
        precedence over form-provided values.
      </Typography>
      <DocsApiTable props={props} />
    </Stack>
  );
}
