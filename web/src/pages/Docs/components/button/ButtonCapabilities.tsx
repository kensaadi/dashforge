import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

export function ButtonCapabilities() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const capabilities = [
    {
      title: 'Full MUI Button API',
      description:
        'All MUI Button props are supported: variant, color, size, startIcon, endIcon, fullWidth, and more. Button is a thin wrapper that preserves the complete MUI ergonomics.',
    },
    {
      title: 'Built-in RBAC Support',
      description:
        'Declarative access control via the access prop. No need for scattered useCan() checks in userland. Hide, disable, or fallback to disabled based on user permissions.',
    },
    {
      title: 'Action Authorization',
      description:
        'Perfect for controlling primary actions (Save, Submit), destructive operations (Delete, Archive), publishing workflows (Publish, Approve), and contextual actions (Edit, Duplicate).',
    },
    {
      title: 'Explicit Readonly Fallback',
      description:
        'Buttons are action components without readonly semantics. When onUnauthorized: "readonly" is used, the button explicitly falls back to disabled state for safe, predictable behavior.',
    },
    {
      title: 'OR Logic for Disabled State',
      description:
        'Combines explicit disabled prop with RBAC access state. Button is disabled if either source requires it, allowing you to mix authorization with loading states and validation.',
    },
    {
      title: 'Zero Dependencies on Form System',
      description:
        'Button does not depend on DashFormContext, react-hook-form, or @dashforge/forms. It only depends on @dashforge/rbac for access control, making it universally usable.',
    },
  ];

  return (
    <Stack spacing={3}>
      {capabilities.map((capability, index) => (
        <Box
          key={index}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 700,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 1,
            }}
          >
            {capability.title}
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            {capability.description}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
