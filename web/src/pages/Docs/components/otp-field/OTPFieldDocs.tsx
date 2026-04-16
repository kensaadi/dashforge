import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import {
  DocsHeroSection,
  DocsSection,
  DocsDivider,
  DocsRelatedSection,
} from '../shared';
import { OTPFieldExamples } from './OTPFieldExamples';
import { OTPFieldCapabilities } from './OTPFieldCapabilities';
import { OTPFieldApi } from './OTPFieldApi';
import { OTPFieldNotes } from './OTPFieldNotes';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * OTPFieldDocs is the main documentation page for the OTPField component
 * Displays title, description, examples, API reference, and implementation notes
 */
export function OTPFieldDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="OTPField"
        description="A slot-based input component for one-time passwords, verification codes, 2FA tokens, and SMS confirmations. Supports numeric, alphanumeric, and alpha modes with keyboard navigation, paste handling, and mobile SMS autofill. Works standalone or with DashForm integration."
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

          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              mb: 1,
            }}
          >
            For verification codes—OTP, 2FA, SMS codes, and security tokens
          </Typography>

          <DocsCodeBlock
            code={`import { OTPField } from '@dashforge/ui';

<OTPField name="otp" length={6} />`}
            language="tsx"
          />
        </Stack>
      </Box>

      {/* Examples Section */}
      <DocsSection
        id="examples"
        title="Examples"
        description="Common OTPField patterns and configurations"
      >
        <OTPFieldExamples />
      </DocsSection>

      {/* Capabilities */}
      <DocsSection
        id="capabilities"
        title="Dashforge Capabilities"
        description="Progressive adoption from controlled components to reactive forms"
      >
        <OTPFieldCapabilities />
      </DocsSection>

      <DocsDivider />

      {/* API Reference */}
      <DocsSection
        id="api"
        title="API Reference"
        description="Complete props and type definitions"
      >
        <OTPFieldApi />
      </DocsSection>

      <DocsDivider />

      {/* Under the hood */}
      <DocsSection
        id="notes"
        title="Under the hood"
        description="How OTPField behaves and why it works this way"
      >
        <OTPFieldNotes />
      </DocsSection>

      <DocsDivider />

      {/* Related Topics */}
      <DocsRelatedSection
        links={[
          {
            label: 'TextField',
            path: '/docs/components/text-field',
            description: 'Single-line text input',
          },
          {
            label: 'NumberField',
            path: '/docs/components/number-field',
            description: 'Numeric input with formatting',
          },
          {
            label: 'Form System Quick Start',
            path: '/docs/form-system/quick-start',
            description: 'Build your first dynamic form',
          },
        ]}
      />
    </Stack>
  );
}
