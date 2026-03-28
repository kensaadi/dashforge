import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * RadioGroupNotes displays implementation notes and usage guidelines
 */
export function RadioGroupNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Built on MUI',
      content:
        'RadioGroup is built on top of Material-UI RadioGroup component, inheriting all its styling and behavior capabilities. Options are automatically rendered as FormControlLabel components wrapping Radio buttons. When a label is provided, it displays as a FormLabel above the radio group.',
    },
    {
      title: 'DashForm Integration',
      content:
        'When used inside DashForm, RadioGroup automatically binds to the form through the DashFormBridge. The component self-registers on mount, binding value, onChange, and onBlur handlers automatically. Validation errors from form context display as helperText. No explicit prop passing required—integration is seamless.',
    },
    {
      title: 'Standalone Usage',
      content:
        'RadioGroup can be used as a standalone component outside of DashForm. In this mode, it behaves like a regular MUI RadioGroup and requires explicit value and onChange props for controlled behavior. You must also provide the options array in all usage modes.',
    },
    {
      title: 'Error Gating',
      content:
        'Errors are displayed only when the field is touched (after blur) OR when the form has been submitted. This prevents showing validation errors while the user is still interacting with the radio group. Touch tracking occurs on blur events.',
    },
    {
      title: 'Single Choice Selection',
      content:
        'RadioGroup enforces single-choice selection semantics. Only one radio button can be selected at a time. The component returns a string value representing the selected option. Use Checkbox for multiple-choice scenarios where users can select more than one option.',
    },
    {
      title: 'Options Array',
      content:
        'The options prop is required and defines available choices. Each option has a value (string), label (React.ReactNode), and optional disabled (boolean) property. Options are rendered in the order they appear in the array. Dynamic options are supported—update the array to change available choices.',
    },
    {
      title: 'Reactive Visibility',
      content:
        'RadioGroup supports conditional rendering through the visibleWhen prop (part of Reactive V2 architecture). This is a component-level decision powered by engine-driven predicates. The engine provides access to all field state via getNode(name), and the component re-evaluates visibility on dependency changes. When visibleWhen returns false, the component renders null.',
    },
    {
      title: 'Common Use Cases',
      content:
        'RadioGroup is ideal for account type selection, shipping methods, plan tiers, contact preferences, and any mutually exclusive choice scenario. For mandatory selection, use rules={{ required: "message" }} to enforce validation.',
    },
    {
      title: 'Type Safety',
      content:
        'All RadioGroup components are fully typed with TypeScript, providing autocompletion and type checking in your IDE. The value is always typed as string in form data. Options must conform to the RadioGroupOption interface.',
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
