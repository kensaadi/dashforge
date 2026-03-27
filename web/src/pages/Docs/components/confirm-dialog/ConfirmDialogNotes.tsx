import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * ConfirmDialogNotes displays implementation notes and usage guidelines
 */
export function ConfirmDialogNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'When NOT to Use ConfirmDialog',
      content:
        'ConfirmDialog is designed for simple confirmation flows with standard layouts. For custom layouts, complex forms, or multi-step wizards, use MUI Dialog directly. ConfirmDialog provides a quick imperative API for common cases—it is NOT a replacement for all dialog use cases.',
      highlight: true,
    },
    {
      title: 'Re-entrancy Policy',
      content:
        'Only one confirmation can be active at a time. Calling confirm() while another confirmation is pending will reject the previous promise with "cancelled" and immediately show the new confirmation. This prevents stacking multiple dialogs.',
    },
    {
      title: 'Promise Behavior',
      content:
        'The confirm() hook returns a discriminated union result, not a boolean. Always check result.confirmed before proceeding. Cancelled confirmations return { confirmed: false, reason: "cancelled" } or { confirmed: false, reason: "closed" }.',
    },
    {
      title: 'Provider Scope',
      content:
        'Wrap ConfirmDialogProvider at the highest level where confirmations are needed (typically at the app root or route layout). The useConfirm() hook must be called within a component tree wrapped by the provider.',
    },
    {
      title: 'Provider Unmount Behavior',
      content:
        'If the provider unmounts while a confirmation is pending, the promise resolves with { confirmed: false, reason: "cancelled" }. This ensures cleanup and prevents memory leaks during navigation or conditional rendering.',
    },
    {
      title: 'Async Action Handling',
      content:
        'For async actions (like API calls), handle loading states explicitly in your calling code. ConfirmDialog confirms user intent—it does not manage async execution. Show loading indicators or disable UI after confirmation as needed.',
    },
    {
      title: 'Form Integration Pattern',
      content:
        'When using with forms, combine with form dirty state checks to guard navigation or unsaved changes. The confirmation should be triggered by your logic (e.g., beforeunload, navigation guard) rather than by the form itself.',
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
                  ? 'rgba(139,92,246,0.15)'
                  : 'rgba(139,92,246,0.10)',
                border: note.highlight
                  ? isDark
                    ? '1px solid rgba(239,68,68,0.35)'
                    : '1px solid rgba(239,68,68,0.25)'
                  : isDark
                  ? '1px solid rgba(139,92,246,0.25)'
                  : '1px solid rgba(139,92,246,0.20)',
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
