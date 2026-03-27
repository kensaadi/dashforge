import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * SnackbarNotes displays implementation notes and usage guidelines
 */
export function SnackbarNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Maximum Visible Snackbars',
      content:
        'Maximum of 3 visible snackbars. Additional notifications are queued and displayed as others dismiss.',
    },
    {
      title: 'FIFO Queue Behavior',
      content:
        'Notifications display in first-in, first-out order. The queue processes automatically as snackbars dismiss.',
    },
    {
      title: 'Auto-Dismiss Behavior',
      content:
        'Default auto-dismiss is 5000ms (5 seconds). Timer starts when visible, not when enqueued. Set autoHideDuration to null for persistent notifications.',
    },
    {
      title: 'closeAll() Semantics',
      content:
        'closeAll() dismisses all visible snackbars and clears the queue. Useful for navigation or logout events.',
    },
    {
      title: 'When NOT to Use Snackbar',
      content:
        'Snackbar is for brief, non-critical notifications. For user confirmation, use ConfirmDialog. For critical errors requiring acknowledgment, use Dialog. For complex layouts or forms, use Dialog or custom components. Never use snackbars for blocking interactions.',
      highlight: true,
    },
    {
      title: 'Provider Scope',
      content:
        'Wrap SnackbarProvider at app root or highest level where notifications are needed. useSnackbar() must be called within provider scope. Snackbars render at provider level.',
    },
    {
      title: 'Action Button Best Practices',
      content:
        'Keep actions simple (e.g., "Undo", "View"). For undo patterns, use 7-10 second autoHideDuration. Always handle auto-dismiss before user clicks.',
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
            bgcolor: note.highlight
              ? isDark
                ? 'rgba(239,68,68,0.08)'
                : 'rgba(254,202,202,0.30)'
              : isDark
              ? 'rgba(17,24,39,0.35)'
              : 'rgba(248,250,252,0.80)',
            border: note.highlight
              ? isDark
                ? '1px solid rgba(239,68,68,0.25)'
                : '1px solid rgba(239,68,68,0.20)'
              : isDark
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(15,23,42,0.08)',
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: note.highlight
                ? isDark
                  ? 'rgba(239,68,68,0.12)'
                  : 'rgba(254,202,202,0.45)'
                : isDark
                ? 'rgba(17,24,39,0.50)'
                : 'rgba(255,255,255,0.90)',
              borderColor: note.highlight
                ? isDark
                  ? 'rgba(239,68,68,0.35)'
                  : 'rgba(239,68,68,0.30)'
                : isDark
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
                bgcolor: note.highlight
                  ? isDark
                    ? 'rgba(239,68,68,0.20)'
                    : 'rgba(239,68,68,0.15)'
                  : isDark
                  ? 'rgba(251,191,36,0.15)'
                  : 'rgba(251,191,36,0.10)',
                border: note.highlight
                  ? isDark
                    ? '1px solid rgba(239,68,68,0.35)'
                    : '1px solid rgba(239,68,68,0.25)'
                  : isDark
                  ? '1px solid rgba(251,191,36,0.25)'
                  : '1px solid rgba(251,191,36,0.20)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: note.highlight
                    ? isDark
                      ? 'rgba(239,68,68,0.90)'
                      : 'rgba(220,38,38,0.90)'
                    : isDark
                    ? 'rgba(251,191,36,0.90)'
                    : 'rgba(217,119,6,0.90)',
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
