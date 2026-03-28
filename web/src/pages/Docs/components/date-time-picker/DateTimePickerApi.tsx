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
    name: 'mode',
    type: '"date" | "time" | "datetime"',
    defaultValue: '"datetime"',
    description:
      'Picker mode: "date" for date-only, "time" for time-only, "datetime" for date and time combined. Determines the native input type used.',
  },
  {
    name: 'label',
    type: 'React.ReactNode',
    description: 'Label text displayed above the picker',
  },
  {
    name: 'value',
    type: 'string | null',
    description:
      'Controlled value in ISO 8601 UTC format. Example: "2024-03-28T14:30:00.000Z". Component converts between ISO and native input format automatically.',
  },
  {
    name: 'onChange',
    type: '(value: string | null) => void',
    description:
      'Callback fired when the value changes. Receives ISO 8601 UTC string or null. Simplified from standard onChange—no event wrapper.',
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
      'Helper text displayed below picker. Explicit helperText prop overrides form-provided validation error message. When inside DashForm, validation errors display as helperText (gated by touched/submitted state).',
  },
  {
    name: 'disabled',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the picker is disabled',
  },
  {
    name: 'rules',
    type: 'ValidationRules',
    description:
      'Validation rules for DashForm integration. Format follows React Hook Form rules contract (required, validate, etc.). Only used when inside DashForm—ignored in standalone mode.',
  },
  {
    name: 'visibleWhen',
    type: '(engine: Engine) => boolean',
    description:
      'Component-level conditional rendering predicate. Receives engine instance with access to all field state via getNode(name). When false, component renders null. Re-evaluates on dependency changes. Only works inside DashForm (requires engine).',
  },
];

/**
 * DateTimePickerApi displays the props table for DateTimePicker component
 */
export function DateTimePickerApi() {
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
        <strong>Storage Format:</strong> DateTimePicker stores values as ISO
        8601 UTC strings (e.g., "2024-03-28T14:30:00.000Z") or null. The
        component automatically converts between ISO format and native input
        format. <strong>Explicit vs Auto-Bound Props:</strong> When inside
        DashForm, DateTimePicker receives value, error, helperText, onChange,
        and onBlur automatically through field binding. Explicit props always
        take precedence over form-provided values.
      </Typography>
      <DocsApiTable props={props} />
    </Stack>
  );
}
