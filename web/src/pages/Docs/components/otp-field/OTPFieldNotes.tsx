import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * OTPFieldNotes displays "Under the hood" technical insights
 * Compact, high-signal explanation of OTPField behavior and architecture
 */
export function OTPFieldNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Form integration',
      content:
        'Automatically binds to form state inside DashForm. Single onChange handler with string value.\n\nWorks standalone with controlled value/onChange props when outside DashForm.',
    },
    {
      title: 'Behavior model',
      content:
        'Single accessible input with visual slot representation. Keyboard navigation (arrow keys, backspace) and paste handling built-in.\n\nMobile SMS autofill via autoComplete="one-time-code". Errors gated by Form Closure v1 (touch + submit).',
    },
    {
      title: 'Architecture',
      content:
        'Built on slot-based UI primitive with single input for accessibility. Supports numeric, alphanumeric, and alpha modes.\n\nFully typed with TypeScript. Caret management for seamless UX.',
    },
  ];

  return (
    <Stack spacing={3}>
      {notes.map((note) => (
        <Box
          key={note.title}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(17,24,39,0.40)' : 'rgba(248,250,252,0.90)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.10)',
          }}
        >
          <Stack spacing={1.5}>
            <Typography
              variant="h6"
              sx={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
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
                whiteSpace: 'pre-line',
              }}
            >
              {note.content}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
