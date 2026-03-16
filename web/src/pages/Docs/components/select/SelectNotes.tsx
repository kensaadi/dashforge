import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * SelectNotes displays implementation notes and usage guidelines
 */
export function SelectNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Composed from TextField',
      content:
        'Select is built on top of the Dashforge TextField component with select mode enabled. It inherits all TextField capabilities including form integration, validation, and layout modes.',
    },
    {
      title: 'Options-Based API',
      content:
        'Unlike MUI Select which uses MenuItem children, Dashforge Select uses an options array prop for cleaner, more declarative code. The component automatically renders MenuItems internally.',
    },
    {
      title: 'Form Integration',
      content:
        'When used inside DashForm, Select automatically integrates with React Hook Form through the DashFormBridge. It handles value binding, validation, and error display without explicit prop passing.',
    },
    {
      title: 'Standalone Usage',
      content:
        'Select can be used as a standalone component outside of DashForm. In this mode, it behaves like a regular MUI TextField with select mode and requires explicit value and onChange props.',
    },
    {
      title: 'Error Gating',
      content:
        'Errors are displayed only when the field is touched (after blur) OR when the form has been submitted. This prevents showing validation errors before the user interacts with the dropdown.',
    },
    {
      title: 'Conditional Visibility',
      content:
        'Select supports reactive visibility through the visibleWhen prop, enabling dynamic form behavior where select fields appear or disappear based on other field values or application state.',
    },
    {
      title: 'Layout Modes',
      content:
        'Select supports three layout modes: floating (default), stacked, and inline. These control how the label and field are positioned, allowing you to match different design systems and UI patterns.',
    },
    {
      title: 'Type Safety',
      content:
        'Select is fully typed with TypeScript generics, supporting both string and number option values. The component provides autocompletion for options and type checking throughout.',
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
