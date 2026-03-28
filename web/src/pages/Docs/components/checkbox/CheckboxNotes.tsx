import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * CheckboxNotes displays implementation notes and usage guidelines
 */
export function CheckboxNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Built on MUI',
      content:
        'Checkbox is built on top of Material-UI Checkbox component, inheriting all its styling and behavior capabilities. When a label is provided, it automatically wraps the checkbox in FormControlLabel for proper label association.',
    },
    {
      title: 'DashForm Integration',
      content:
        'When used inside DashForm, Checkbox automatically binds to the form through the DashFormBridge. The component self-registers on mount, binding checked, onChange, and onBlur handlers automatically. Validation errors from form context display as helperText. No explicit prop passing required—integration is seamless.',
    },
    {
      title: 'Standalone Usage',
      content:
        'Checkbox can be used as a standalone component outside of DashForm. In this mode, it behaves like a regular MUI Checkbox and requires explicit checked and onChange props for controlled behavior.',
    },
    {
      title: 'Error Gating',
      content:
        'Errors are displayed only when the field is touched (after blur) OR when the form has been submitted. This prevents showing validation errors while the user is still interacting with the checkbox. Touch tracking occurs on blur events.',
    },
    {
      title: 'Boolean Value',
      content:
        'Checkbox always returns boolean values (true/false) through form state. This differs from text inputs which return string values. When binding to form state, the checked prop is automatically resolved from the boolean value in the form.',
    },
    {
      title: 'Reactive Visibility',
      content:
        'Checkbox supports conditional rendering through the visibleWhen prop (part of Reactive V2 architecture). This is a component-level decision powered by engine-driven predicates. The engine provides access to all field state via getNode(name), and the component re-evaluates visibility on dependency changes. When visibleWhen returns false, the component renders null.',
    },
    {
      title: 'Common Use Cases',
      content:
        'Checkbox is ideal for terms acceptance, consent workflows, settings toggles, feature opt-ins, and multi-option selections. For mandatory acceptance (like terms and conditions), use rules={{ required: "message" }} to enforce validation.',
    },
    {
      title: 'Type Safety',
      content:
        'All Checkbox components are fully typed with TypeScript, providing autocompletion and type checking in your IDE. The checked value is always typed as boolean in form data.',
    },
  ];

  return (
    <Stack spacing={2.5}>
      {notes.map((note, index) => (
        <Box
          key={note.title}
          sx={{
            p: 2.5,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(17,24,39,0.35)' : 'rgba(248,250,252,0.80)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(15,23,42,0.08)',
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: isDark
                ? 'rgba(17,24,39,0.50)'
                : 'rgba(255,255,255,0.90)',
              borderColor: isDark
                ? 'rgba(255,255,255,0.10)'
                : 'rgba(15,23,42,0.12)',
            },
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              sx={{
                mt: 0.5,
                minWidth: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: isDark
                  ? 'rgba(139,92,246,0.15)'
                  : 'rgba(139,92,246,0.10)',
                border: isDark
                  ? '1px solid rgba(139,92,246,0.25)'
                  : '1px solid rgba(139,92,246,0.20)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isDark
                    ? 'rgba(139,92,246,0.90)'
                    : 'rgba(109,40,217,0.90)',
                }}
              >
                {index + 1}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.75,
                }}
              >
                {note.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {note.content}
              </Typography>
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
