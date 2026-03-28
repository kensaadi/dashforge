import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsHeroSection, DocsSection } from '../shared';
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
      {/* Hero Section */}
      <Stack spacing={3}>
        <DocsHeroSection
          title="Snackbar"
          description="Fire-and-forget notifications with zero boilerplate. Show success, error, and info messages instantly with automatic queue management and dismiss."
          themeColor="amber"
        />
        {/* Snackbar-specific badge - Imperative Pattern */}
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
      <DocsSection
        id="quick-start"
        title="Quick Start"
        description="Set up the provider and start showing notifications"
      >
        <SnackbarQuickStart />
      </DocsSection>

      {/* Examples Section */}
      <DocsSection
        id="examples"
        title="Examples"
        description="Interactive demos showing common usage patterns"
      >
        <SnackbarExamples />
      </DocsSection>

      {/* Scenarios Section */}
      <DocsSection
        id="scenarios"
        title="Real-World Scenarios"
        description="Common use cases and implementation patterns"
      >
        <SnackbarScenarios />
      </DocsSection>

      {/* API Reference Section */}
      <DocsSection
        id="api"
        title="API Reference"
        description="Complete API documentation"
      >
        <SnackbarApi />
      </DocsSection>

      {/* Implementation Notes Section */}
      <DocsSection
        id="notes"
        title="Implementation Notes"
        description="Important details about behavior and best practices"
      >
        <SnackbarNotes />
      </DocsSection>
    </Stack>
  );
}
