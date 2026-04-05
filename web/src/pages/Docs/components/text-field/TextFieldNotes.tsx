import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * TextFieldNotes displays "Under the hood" technical insights
 * Compact, high-signal explanation of TextField behavior and architecture
 */
export function TextFieldNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Form integration',
      content:
        'Automatically binds to form state inside DashForm. No Controller, no manual wiring.\n\nWorks as a standard MUI TextField when used standalone.',
    },
    {
      title: 'Behavior model',
      content:
        'Errors appear only after blur or submit. Fields can react to form state using visibleWhen.\n\nNo manual orchestration required.',
    },
    {
      title: 'Architecture',
      content:
        'Built on top of MUI TextField. Fully typed with TypeScript.\n\nDesigned as a foundation for composed form behaviors.',
    },
  ];

  return (
    <Stack spacing={3}>
      {notes.map((note, index) => (
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
