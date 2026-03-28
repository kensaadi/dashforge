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
    name: 'label',
    type: 'React.ReactNode',
    description:
      'Label text displayed next to the checkbox. When provided, wraps the checkbox in FormControlLabel.',
  },
  {
    name: 'checked',
    type: 'boolean',
    description: 'Controlled checked state of the checkbox',
  },
  {
    name: 'onChange',
    type: '(event) => void',
    description: 'Callback fired when the checked state changes',
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
      'Helper text displayed below checkbox. Explicit helperText prop overrides form-provided validation error message. When inside DashForm, validation errors display as helperText (gated by touched/submitted state).',
  },
  {
    name: 'disabled',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the checkbox is disabled',
  },
  {
    name: 'rules',
    type: 'ValidationRules',
    description:
      'Validation rules for DashForm integration. Format follows React Hook Form rules contract. Only used when inside DashForm—ignored in standalone mode. Common rule: { required: "message" } for mandatory acceptance.',
  },
  {
    name: 'visibleWhen',
    type: '(engine: Engine) => boolean',
    description:
      'Component-level conditional rendering predicate. Receives engine instance with access to all field state via getNode(name). When false, component renders null. Re-evaluates on dependency changes. Only works inside DashForm (requires engine).',
  },
];

/**
 * CheckboxApi displays the props table for Checkbox component
 */
export function CheckboxApi() {
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
        Checkbox receives checked, error, helperText, onChange, and onBlur
        automatically through field binding. Explicit props always take
        precedence over form-provided values.
      </Typography>
      <DocsApiTable props={props} />
    </Stack>
  );
}
