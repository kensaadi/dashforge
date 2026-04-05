import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsApiTable, type ApiPropDefinition } from '../shared';
import { DocsCodeBlock } from '../shared/CodeBlock';

const props: ApiPropDefinition[] = [
  {
    name: 'access',
    type: 'AccessRequirement',
    description:
      'RBAC access control requirement. Controls button visibility and interaction based on user permissions. Supports hide, disable, and readonly (falls back to disabled) strategies.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    defaultValue: 'false',
    description:
      'If true, the button is disabled. Combines with RBAC access state via OR logic.',
  },
  {
    name: 'variant',
    type: "'text' | 'outlined' | 'contained'",
    defaultValue: "'text'",
    description: 'Button visual style',
  },
  {
    name: 'color',
    type: "'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'",
    defaultValue: "'primary'",
    description: 'Button color theme',
  },
  {
    name: 'size',
    type: "'small' | 'medium' | 'large'",
    defaultValue: "'medium'",
    description: 'Button size',
  },
  {
    name: 'onClick',
    type: '(event: React.MouseEvent<HTMLButtonElement>) => void',
    description: 'Callback fired when the button is clicked',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Button content (text, icons, etc.)',
  },
  {
    name: 'startIcon',
    type: 'React.ReactNode',
    description: 'Element placed before the children',
  },
  {
    name: 'endIcon',
    type: 'React.ReactNode',
    description: 'Element placed after the children',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the button takes up the full width of its container',
  },
  {
    name: 'type',
    type: "'button' | 'submit' | 'reset'",
    defaultValue: "'button'",
    description: 'HTML button type attribute',
  },
  {
    name: 'href',
    type: 'string',
    description:
      'URL to link to when the button is clicked. Renders as anchor element when provided.',
  },
];

/**
 * ButtonApi displays the props table for Button component
 */
export function ButtonApi() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          }}
        >
          <strong>RBAC and Disabled State:</strong> Button combines explicit{' '}
          <code>disabled</code> prop with RBAC access state using OR logic. The
          button is disabled if either the explicit prop is true OR RBAC
          requires it (onUnauthorized: 'disable' or 'readonly').
        </Typography>
        <DocsApiTable props={props} />
      </Stack>

      <Stack spacing={2}>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: isDark ? '#ffffff' : '#0f172a',
          }}
        >
          Type Definitions
        </Typography>
        <DocsCodeBlock
          code={`interface ButtonProps extends Omit<MuiButtonProps, 'disabled'> {
  access?: AccessRequirement;
  disabled?: boolean;
}

interface AccessRequirement {
  resource: string;
  action: string;
  onUnauthorized: 'hide' | 'disable' | 'readonly';
}`}
          language="typescript"
        />
      </Stack>

      <Typography
        variant="body2"
        sx={{
          fontSize: 14,
          lineHeight: 1.6,
          color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          fontStyle: 'italic',
        }}
      >
        <strong>Note:</strong> All other MUI Button props are supported through
        prop forwarding (component, sx, disableRipple, etc.). See{' '}
        <a
          href="https://mui.com/material-ui/api/button/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: isDark ? '#60a5fa' : '#2563eb',
            textDecoration: 'underline',
          }}
        >
          MUI Button API
        </a>{' '}
        for complete prop reference.
      </Typography>
    </Stack>
  );
}
