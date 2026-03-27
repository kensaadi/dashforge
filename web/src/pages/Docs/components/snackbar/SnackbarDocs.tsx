import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { SnackbarQuickStart } from './SnackbarQuickStart';
import { SnackbarExamples } from './SnackbarExamples';
import { SnackbarScenarios } from './SnackbarScenarios';
import { SnackbarApi } from './SnackbarApi';
import { SnackbarNotes } from './SnackbarNotes';

/**
 * SnackbarDocs is the main documentation page for the Snackbar system
 * Displays title, description, examples, API reference, and implementation notes
 */
export function SnackbarDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section - Compact */}
      <Stack spacing={3}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: 40, md: 56 },
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: isDark ? '#ffffff' : '#0f172a',
            background: isDark
              ? 'linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Snackbar
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: 19,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            maxWidth: 680,
          }}
        >
          Fire-and-forget notifications with zero boilerplate. Show success,
          error, and info messages instantly with automatic queue management and
          dismiss.
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            px: 2,
            py: 0.75,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.10)',
            border: isDark
              ? '1px solid rgba(251,191,36,0.30)'
              : '1px solid rgba(251,191,36,0.25)',
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: isDark ? '#fde047' : '#d97706',
            }}
          >
            Imperative Pattern
          </Typography>
        </Box>
      </Stack>

      {/* Quick Start Section */}
      <Stack spacing={4} id="quick-start">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            Quick Start
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Set up the provider and start showing notifications
          </Typography>
        </Box>
        <SnackbarQuickStart />
      </Stack>

      {/* Examples Section */}
      <Stack spacing={4} id="examples">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            Examples
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Interactive demos showing common usage patterns
          </Typography>
        </Box>
        <SnackbarExamples />
      </Stack>

      {/* Scenarios Section */}
      <Stack spacing={4} id="scenarios">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            Real-World Scenarios
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Common use cases and implementation patterns
          </Typography>
        </Box>
        <SnackbarScenarios />
      </Stack>

      {/* API Reference Section */}
      <Stack spacing={4} id="api">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            API Reference
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Complete API documentation
          </Typography>
        </Box>
        <SnackbarApi />
      </Stack>

      {/* Implementation Notes Section */}
      <Stack spacing={4} id="notes">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            Implementation Notes
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Important details about behavior and best practices
          </Typography>
        </Box>
        <SnackbarNotes />
      </Stack>
    </Stack>
  );
}
