import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * CheckboxNotes displays "Under the hood" technical insights
 * Compact, high-signal explanation of Checkbox behavior and architecture
 */
export function CheckboxNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Form integration',
      content:
        'Automatically binds to form state inside DashForm. No Controller, no manual wiring.\n\nWorks as a standard MUI Checkbox when used standalone.',
    },
    {
      title: 'Behavior model',
      content:
        'Returns boolean values (true/false). Errors appear only after blur or submit.\n\nSupports conditional visibility via visibleWhen—show/hide based on other field values.',
    },
    {
      title: 'Architecture',
      content:
        'Built on MUI Checkbox with FormControlLabel for label association. Fully typed with TypeScript.\n\nPurpose-built for terms acceptance, consent workflows, settings toggles, and feature opt-ins.',
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
