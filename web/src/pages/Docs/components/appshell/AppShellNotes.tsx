import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Implementation Notes section for AppShell
 * Technical details and best practices
 */
export function AppShellNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Responsive Behavior',
      content:
        'AppShell automatically switches between desktop and mobile layouts based on the breakpoint prop. On mobile, LeftNav becomes a temporary drawer that overlays content.',
    },
    {
      title: 'Navigation State',
      content:
        'Supports both controlled and uncontrolled modes. Use navOpen/onNavOpenChange for controlled state, or defaultNavOpen for uncontrolled mode.',
    },
    {
      title: 'Router Integration',
      content:
        'AppShell is router-agnostic. Use the renderLink prop to integrate with React Router, Next.js router, or any other routing solution.',
    },
    {
      title: 'Fixed TopBar Spacing',
      content:
        "When topBarPosition is 'fixed', AppShell automatically adds a Toolbar spacer to prevent content from being hidden under the fixed header.",
    },
    {
      title: 'Main Content Offset',
      content:
        'The main content area automatically adjusts its left margin based on LeftNav width and open/closed state for smooth transitions.',
    },
  ];

  return (
    <Stack spacing={3}>
      {notes.map((note, index) => (
        <Box
          key={index}
          sx={{
            p: 3,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.15)'
              : '1px solid rgba(59,130,246,0.12)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: 15,
              fontWeight: 600,
              color: isDark ? '#60a5fa' : '#2563eb',
              mb: 1,
            }}
          >
            {note.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 14,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            {note.content}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
