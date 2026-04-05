import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

export function ButtonNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Readonly Fallback Behavior',
      description:
        'Buttons are action components without readonly semantics. When access.onUnauthorized is set to "readonly", the button falls back to disabled state. This is an explicit, safe choice: a disabled button clearly signals that the action cannot be performed, preventing unintended execution.',
    },
    {
      title: 'OR Logic for Disabled State',
      description:
        'The effective disabled state uses OR logic: effectiveDisabled = disabled || accessState.disabled || accessState.readonly. This means the button is disabled if ANY source requires it (explicit prop, RBAC disable, or RBAC readonly fallback).',
    },
    {
      title: 'RBAC is Authorization, Not All UI Logic',
      description:
        'RBAC controls permissions (can user perform this action?), not application state (is action currently in progress?). Combine the access prop with explicit disabled for loading states, validation failures, or business rules.',
    },
    {
      title: 'Not a Form Field',
      description:
        'Button does not integrate with DashFormContext or react-hook-form. It is a pure action component. Use it for triggering actions, not for form field behavior. For form submission, use type="submit" with standard HTML form semantics.',
    },
    {
      title: 'Hide vs Disable',
      description:
        'Use onUnauthorized: "hide" when the action should not be visible to unauthorized users (e.g., Delete User). Use onUnauthorized: "disable" when the action should be visible but not executable (e.g., Publish Article when user can view but not publish).',
    },
    {
      title: 'Full MUI Button API',
      description:
        'All MUI Button props are supported and forwarded correctly: variant, color, size, startIcon, endIcon, fullWidth, href, component, type, and more. Button is a thin wrapper that preserves complete MUI ergonomics.',
    },
  ];

  return (
    <Stack spacing={3}>
      {notes.map((note, index) => (
        <Box
          key={index}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.15)'
              : '1px solid rgba(59,130,246,0.12)',
          }}
        >
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 700,
              color: isDark ? '#60a5fa' : '#2563eb',
              mb: 1,
            }}
          >
            {note.title}
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            {note.description}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
