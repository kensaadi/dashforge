import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsHeroSection, DocsSection, DocsDivider } from '../shared';
import { TopBarExamples } from './TopBarExamples';
import { TopBarCapabilities } from './TopBarCapabilities';
import { TopBarScenarios } from './TopBarScenarios';
import { TopBarApi } from './TopBarApi';
import { TopBarNotes } from './TopBarNotes';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * TopBarDocs is the main documentation page for the TopBar component
 * Displays title, description, examples, API reference, and implementation notes
 */
export function TopBarDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="TopBar"
        description="A responsive application header that coordinates seamlessly with LeftNav. Built on MUI AppBar with intelligent layout shifting, three flexible content slots (left, center, right), and automatic mobile adaptation. Essential for dashboard shells, admin interfaces, and multi-section applications."
        themeColor="blue"
      />

      {/* Quick Start - Ultra Compact Onboarding Card */}
      <Box
        id="quick-start"
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
          border: isDark
            ? '1px solid rgba(59,130,246,0.20)'
            : '1px solid rgba(59,130,246,0.15)',
          position: 'relative',
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: isDark ? '#60a5fa' : '#2563eb',
              }}
            >
              Quick Start
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: isDark
                  ? 'rgba(34,197,94,0.15)'
                  : 'rgba(34,197,94,0.10)',
                border: isDark
                  ? '1px solid rgba(34,197,94,0.30)'
                  : '1px solid rgba(34,197,94,0.25)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isDark ? '#86efac' : '#16a34a',
                }}
              >
                Copy & Paste
              </Typography>
            </Box>
          </Stack>

          <DocsCodeBlock
            code={`import { TopBar } from '@dashforge/ui';
import { useState } from 'react';

const [navOpen, setNavOpen] = useState(true);

<TopBar
  navOpen={navOpen}
  navWidthExpanded={280}
  navWidthCollapsed={64}
  left={<Typography variant="h6">My App</Typography>}
  right={<Avatar src="/user.jpg" />}
/>`}
            language="tsx"
          />
        </Stack>
      </Box>

      {/* Examples Section */}
      <DocsSection
        id="examples"
        title="Examples"
        description="Common TopBar patterns and configurations"
      >
        <TopBarExamples />
      </DocsSection>

      {/* Capabilities */}
      <DocsSection
        id="capabilities"
        title="Dashforge Capabilities"
        description="Intelligent layout coordination with responsive behavior and flexible content slots"
      >
        <TopBarCapabilities />
      </DocsSection>

      <DocsDivider />

      {/* Layout Composition - Practical Demos */}
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
            Layout Composition
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Real-world application shells with dynamic navigation and responsive
            layouts
          </Typography>
        </Box>
        <TopBarScenarios />
      </Stack>

      <DocsDivider />

      {/* API Reference */}
      <DocsSection
        id="api"
        title="API Reference"
        description="Complete props and type definitions"
      >
        <TopBarApi />
      </DocsSection>

      <DocsDivider />

      {/* Implementation Notes */}
      <DocsSection
        id="notes"
        title="Implementation Notes"
        description="Technical details and best practices"
      >
        <TopBarNotes />
      </DocsSection>
    </Stack>
  );
}
