import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * TextFieldNotes displays implementation notes and usage guidelines
 */
export function TextFieldNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Built on MUI',
      content:
        'TextField is built on top of Material-UI TextField component, inheriting all its styling and behavior capabilities.',
    },
    {
      title: 'Form Integration',
      content:
        'When used inside DashForm, TextField automatically integrates with React Hook Form through the DashFormBridge. It handles value binding, validation, and error display without explicit prop passing.',
    },
    {
      title: 'Standalone Usage',
      content:
        'TextField can be used as a standalone component outside of DashForm. In this mode, it behaves like a regular MUI TextField and requires explicit value and onChange props.',
    },
    {
      title: 'Error Gating',
      content:
        'Errors are displayed only when the field is touched (after blur) OR when the form has been submitted. This prevents showing validation errors while the user is still typing.',
    },
    {
      title: 'Predictive Forms',
      content:
        'TextField supports reactive visibility through the visibleWhen prop, enabling dynamic form behavior based on other field values or application state.',
    },
    {
      title: 'Type Safety',
      content:
        'All TextField components are fully typed with TypeScript, providing autocompletion and type checking in your IDE.',
    },
  ];

  return (
    <Stack spacing={3}>
      {notes.map((note) => (
        <Box key={note.title}>
          <Typography
            variant="h6"
            sx={{
              fontSize: 16,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
              mb: 1,
            }}
          >
            {note.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 14,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            {note.content}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
