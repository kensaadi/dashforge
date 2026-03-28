import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * TextareaNotes displays implementation notes and usage guidelines
 */
export function TextareaNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Built on MUI',
      content:
        'Textarea is built on top of Material-UI TextField component with multiline={true} always enabled. It inherits all MUI styling and behavior capabilities, including automatic height expansion as content grows.',
    },
    {
      title: 'Always Multiline',
      content:
        'Unlike TextField which is single-line by default, Textarea is always multiline. This makes it the correct choice for longer text input like comments, descriptions, feedback, messages, and notes. The component name clearly communicates its purpose.',
    },
    {
      title: 'Default Rows',
      content:
        'Textarea defaults to minRows={3}, providing a comfortable starting height for multiline content. You can override this with any value (e.g., minRows={5} for longer content). The textarea automatically expands as the user types more lines.',
    },
    {
      title: 'DashForm Integration',
      content:
        'When used inside DashForm, Textarea automatically binds to the form through the DashFormBridge. The component self-registers on mount, binding value, onChange, and onBlur handlers automatically. Validation errors from form context display as helperText. No explicit prop passing required—integration is seamless.',
    },
    {
      title: 'Standalone Usage',
      content:
        'Textarea can be used as a standalone component outside of DashForm. In this mode, it behaves like a regular MUI TextField and requires explicit value and onChange props for controlled behavior.',
    },
    {
      title: 'Error Gating',
      content:
        'Errors are displayed only when the field is touched (after blur) OR when the form has been submitted. This prevents showing validation errors while the user is still typing. Touch tracking occurs on blur events.',
    },
    {
      title: 'String Value',
      content:
        'Textarea always returns string values through form state, including newline characters (\\n) for multiline content. When processing submitted data, the string will preserve all line breaks exactly as the user entered them.',
    },
    {
      title: 'Reactive Visibility',
      content:
        'Textarea supports conditional rendering through the visibleWhen prop (part of Reactive V2 architecture). This is a component-level decision powered by engine-driven predicates. The engine provides access to all field state via getNode(name), and the component re-evaluates visibility on dependency changes. When visibleWhen returns false, the component renders null.',
    },
    {
      title: 'Textarea vs TextField',
      content:
        'Use Textarea for multiline text input like comments, descriptions, feedback, messages, notes, and longer content (always renders multiple rows). Use TextField for single-line text input like names, emails, search queries, and short text. The component name clearly communicates the intended use case.',
    },
    {
      title: 'Common Use Cases',
      content:
        'Textarea is ideal for comment sections, feedback forms, issue descriptions, notes fields, bio/about sections, message composition, long-form text entry, and any scenario where users need to enter multiple lines of text. For single-line input, use TextField instead.',
    },
    {
      title: 'Type Safety',
      content:
        'All Textarea components are fully typed with TypeScript, providing autocompletion and type checking in your IDE. The value is always typed as string in form data, preserving newline characters.',
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
