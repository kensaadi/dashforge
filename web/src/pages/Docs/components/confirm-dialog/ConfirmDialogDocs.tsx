import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { ConfirmDialogQuickStart } from './ConfirmDialogQuickStart';
import { ConfirmDialogExamples } from './ConfirmDialogExamples';
import { ConfirmDialogResult } from './ConfirmDialogResult';
import { ConfirmDialogScenarios } from './ConfirmDialogScenarios';
import { ConfirmDialogApi } from './ConfirmDialogApi';
import { ConfirmDialogNotes } from './ConfirmDialogNotes';

/**
 * ConfirmDialogDocs is the main documentation page for the ConfirmDialog component
 * Displays title, description, examples, API reference, and implementation notes
 */
export function ConfirmDialogDocs() {
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
              ? 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ConfirmDialog
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
          An imperative confirmation dialog with promise-based API for simple
          user confirmation flows. Provides a quick alternative to MUI Dialog
          for standard confirmation patterns.
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            px: 2,
            py: 0.75,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.10)',
            border: isDark
              ? '1px solid rgba(34,197,94,0.30)'
              : '1px solid rgba(34,197,94,0.25)',
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: isDark ? '#86efac' : '#16a34a',
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
            Two-step setup: wrap your app with the provider and call the hook
          </Typography>
        </Box>
        <ConfirmDialogQuickStart />
      </Stack>

      {/* Examples Section - Clean Demo List */}
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
            Common ConfirmDialog patterns and configurations
          </Typography>
        </Box>
        <ConfirmDialogExamples />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
          my: 4,
        }}
      />

      {/* Result Section - Understanding the Return Value */}
      <Stack spacing={4} id="result">
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
            Understanding the Result
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            How to handle the discriminated union result from confirm()
          </Typography>
        </Box>
        <ConfirmDialogResult />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
          my: 4,
        }}
      />

      {/* Integration Scenarios - Practical Demos */}
      <Stack spacing={4} id="scenarios">
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.15)'
              : '1px solid rgba(59,130,246,0.12)',
          }}
        >
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
            Integration Scenarios
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Real-world integration patterns with navigation guards and async
            actions
          </Typography>
        </Box>
        <ConfirmDialogScenarios />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
          my: 4,
        }}
      />

      {/* API Reference - Dense Table */}
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
            Complete API for ConfirmDialogProvider, useConfirm, and types
          </Typography>
        </Box>
        <ConfirmDialogApi />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
          my: 4,
        }}
      />

      {/* Implementation Notes - Info Cards */}
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
            Technical details, best practices, and usage guidelines
          </Typography>
        </Box>
        <ConfirmDialogNotes />
      </Stack>
    </Stack>
  );
}
