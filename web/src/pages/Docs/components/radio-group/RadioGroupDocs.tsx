import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsHeroSection, DocsSection, DocsDivider } from '../shared';
import { RadioGroupExamples } from './RadioGroupExamples';
import { RadioGroupCapabilities } from './RadioGroupCapabilities';
import { RadioGroupScenarios } from './RadioGroupScenarios';
import { RadioGroupApi } from './RadioGroupApi';
import { RadioGroupNotes } from './RadioGroupNotes';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * RadioGroupDocs is the main documentation page for the RadioGroup component
 * Displays title, description, examples, API reference, and implementation notes
 */
export function RadioGroupDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="RadioGroup"
        description="A single-choice selection component built on MUI RadioGroup. Supports standalone usage, seamless DashForm integration with automatic field binding, validation error gating, and reactive visibility. Perfect for account type selection, shipping methods, plan tiers, and mutually exclusive choices."
        themeColor="purple"
      />

      {/* Quick Start - Ultra Compact Onboarding Card */}
      <Box
        id="quick-start"
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
          border: isDark
            ? '1px solid rgba(139,92,246,0.20)'
            : '1px solid rgba(139,92,246,0.15)',
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
                color: isDark ? '#a78bfa' : '#7c3aed',
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
            code={`import { RadioGroup } from '@dashforge/ui';

<RadioGroup
  name="accountType"
  label="Account Type"
  options={[
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' }
  ]}
/>`}
            language="tsx"
          />
        </Stack>
      </Box>

      {/* Examples Section */}
      <DocsSection
        id="examples"
        title="Examples"
        description="Common RadioGroup patterns and configurations"
      >
        <RadioGroupExamples />
      </DocsSection>

      <DocsDivider />

      {/* Capabilities Section */}
      <DocsSection
        id="capabilities"
        title="Capabilities"
        description="Progressive adoption model from simple controlled component to reactive form integration"
      >
        <RadioGroupCapabilities />
      </DocsSection>

      <DocsDivider />

      {/* Form Integration Scenarios */}
      <Stack spacing={4} id="scenarios">
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.20)'
              : '1px solid rgba(59,130,246,0.15)',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mb: 1,
            }}
          >
            Form Integration
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Real-world scenarios showing RadioGroup integrated with DashForm for
            validation, error handling, and reactive behavior.
          </Typography>
        </Box>
        <RadioGroupScenarios />
      </Stack>

      <DocsDivider />

      {/* API Reference */}
      <DocsSection
        id="api"
        title="API Reference"
        description="Complete RadioGroup props and type definitions"
      >
        <RadioGroupApi />
      </DocsSection>

      <DocsDivider />

      {/* Implementation Notes */}
      <DocsSection
        id="notes"
        title="Implementation Notes"
        description="Technical details and best practices for RadioGroup usage"
      >
        <RadioGroupNotes />
      </DocsSection>
    </Stack>
  );
}
