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
    name: 'length',
    type: 'number',
    defaultValue: '6',
    description: 'Number of OTP slots to render',
  },
  {
    name: 'mode',
    type: "'numeric' | 'alphanumeric' | 'alpha'",
    defaultValue: "'numeric'",
    description:
      'Character entry mode. numeric: 0-9 only. alphanumeric: 0-9, a-z, A-Z. alpha: a-z, A-Z only.',
  },
  {
    name: 'value',
    type: 'string',
    description:
      'Controlled value of the OTP field (complete string, e.g., "123456")',
  },
  {
    name: 'onChange',
    type: '(value: string) => void',
    description:
      'Callback fired when the value changes. Receives the complete OTP string.',
  },
  {
    name: 'onComplete',
    type: '(value: string) => void',
    description:
      'Callback fired when all slots are filled. Useful for auto-submit on completion.',
  },
  {
    name: 'autoFocus',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Auto-focus first slot on mount',
  },
  {
    name: 'label',
    type: 'ReactNode',
    description: 'Label text displayed above the OTP slots',
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
    type: 'ReactNode',
    description:
      'Helper text displayed below slots. Explicit helperText prop overrides form-provided validation error message. When inside DashForm, validation errors display as helperText (gated by touched/submitted state).',
  },
  {
    name: 'disabled',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the OTP field is disabled',
  },
  {
    name: 'required',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, displays required indicator in label',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the container takes up the full width',
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
  {
    name: 'access',
    type: 'AccessRequirement',
    description:
      'RBAC access control configuration. Controls field visibility and interaction based on user permissions. Fields can be hidden, disabled, or readonly when users lack access.',
  },
];

/**
 * OTPFieldApi displays the props table for OTPField component
 */
export function OTPFieldApi() {
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
        OTPField receives value, error, helperText, onChange, and onBlur
        automatically through field binding. Explicit props always take
        precedence over form-provided values.
      </Typography>
      <DocsApiTable props={props} />
    </Stack>
  );
}
