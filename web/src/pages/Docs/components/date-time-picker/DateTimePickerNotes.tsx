import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * DateTimePickerNotes displays "Under the hood" technical insights
 * Compact, high-signal explanation of DateTimePicker behavior and architecture
 */
export function DateTimePickerNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Form integration',
      content:
        'Automatically binds to form state inside DashForm. No manual wiring required.\n\nWorks standalone with explicit value/onChange props. Values are ISO 8601 UTC strings (e.g., "2024-03-28T14:30:00.000Z").',
    },
    {
      title: 'Behavior model',
      content:
        'Three modes: "date", "time", or "datetime" (default). Built on native HTML inputs for zero dependencies.\n\nErrors appear only after blur or submit. Supports visibleWhen for conditional rendering via Reactive V2.',
    },
    {
      title: 'Architecture',
      content:
        'Built on native HTML date/time inputs, not MUI X Date Pickers. Browser appearance varies, but data handling is consistent.\n\nPurpose-built for appointments, deadlines, reminders, and any timestamp input.',
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
