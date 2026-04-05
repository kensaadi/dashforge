import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsHeroSection, DocsSection, DocsDivider } from '../shared';
import { TextFieldPlayground } from './TextFieldPlayground';
import { TextFieldExamples } from './TextFieldExamples';
import { TextFieldLayoutVariants } from './TextFieldLayoutVariants';
import { TextFieldCapabilities } from './TextFieldCapabilities';
import { TextFieldScenarios } from './TextFieldScenarios';
import { TextFieldApi } from './TextFieldApi';
import { TextFieldNotes } from './TextFieldNotes';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * TextFieldDocs is the main documentation page for the TextField component
 * Displays title, description, examples, API reference, and implementation notes
 */
export function TextFieldDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="TextField"
        description="An intelligent input component built on MUI TextField. Supports standalone usage, seamless DashForm integration with automatic field binding, validation error gating, and reactive visibility. The foundation for composed field behaviors."
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
            code={`import { TextField } from '@dashforge/ui';

<TextField label="Email" name="email" />`}
            language="tsx"
          />
        </Stack>
      </Box>

      {/* Examples Section - Grouped with Layout Variants (tighter spacing) */}
      <Stack spacing={6}>
        <DocsSection
          id="examples"
          title="Examples"
          description="Common TextField patterns and configurations"
        >
          <TextFieldExamples />
        </DocsSection>

        {/* Layout Variants */}
        <DocsSection
          id="layout-variants"
          title="Layout Variants"
          description="Floating, stacked, and inline label layouts"
        >
          <TextFieldLayoutVariants />
        </DocsSection>
      </Stack>

      {/* Interactive Playground */}
      <Stack spacing={3.5} id="playground">
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
            Interactive Playground
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Experiment with props and see live results
          </Typography>
        </Box>

        <TextFieldPlayground />
      </Stack>

      {/* Capabilities & Access Control - Grouped together (tighter spacing) */}
      <Stack spacing={6}>
        {/* Capabilities */}
        <DocsSection
          id="capabilities"
          title="Dashforge Capabilities"
          description="Progressive adoption from controlled components to predictive forms"
        >
          <TextFieldCapabilities />
        </DocsSection>

        {/* Access Control (RBAC) - Compact Grid Layout */}
        <Stack spacing={4} id="access-control">
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
              Access Control (RBAC)
            </Typography>
            <Typography
              sx={{
                fontSize: 17,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.65)'
                  : 'rgba(15,23,42,0.65)',
                maxWidth: 720,
              }}
            >
              Control field visibility and interaction based on user
              permissions. Fields can be hidden, disabled, or readonly when
              users lack access.
            </Typography>
          </Box>

          {/* Compact Grid of Access Patterns */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 3,
            }}
          >
            {/* Pattern 1: Hide */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: isDark
                  ? 'rgba(17,24,39,0.40)'
                  : 'rgba(248,250,252,0.90)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.10)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : '#0f172a',
                  mb: 1.5,
                }}
              >
                Hide when unauthorized
              </Typography>
              <DocsCodeBlock
                code={`<TextField
  name="salary"
  access={{
    resource: 'user.salary',
    action: 'read',
    onUnauthorized: 'hide',
  }}
/>`}
                language="tsx"
              />
            </Box>

            {/* Pattern 2: Disable */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: isDark
                  ? 'rgba(17,24,39,0.40)'
                  : 'rgba(248,250,252,0.90)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.10)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : '#0f172a',
                  mb: 1.5,
                }}
              >
                Disable when cannot edit
              </Typography>
              <DocsCodeBlock
                code={`<TextField
  name="status"
  access={{
    resource: 'user.status',
    action: 'update',
    onUnauthorized: 'disable',
  }}
/>`}
                language="tsx"
              />
            </Box>

            {/* Pattern 3: Readonly */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: isDark
                  ? 'rgba(17,24,39,0.40)'
                  : 'rgba(248,250,252,0.90)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.10)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : '#0f172a',
                  mb: 1.5,
                }}
              >
                Readonly for view-only
              </Typography>
              <DocsCodeBlock
                code={`<TextField
  name="email"
  access={{
    resource: 'user.email',
    action: 'update',
    onUnauthorized: 'readonly',
  }}
/>`}
                language="tsx"
              />
            </Box>

            {/* Pattern 4: Combined with visibleWhen */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: isDark
                  ? 'rgba(17,24,39,0.40)'
                  : 'rgba(248,250,252,0.90)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.10)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : '#0f172a',
                  mb: 1.5,
                }}
              >
                Combined with visibleWhen
              </Typography>
              <DocsCodeBlock
                code={`<TextField
  name="other"
  visibleWhen={(engine) =>
    engine.getNode('category')?.value === 'other'
  }
  access={{
    resource: 'form.other',
    action: 'read',
    onUnauthorized: 'hide',
  }}
/>`}
                language="tsx"
              />
            </Box>
          </Box>

          {/* Implementation Note - Compact */}
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: isDark
                ? 'rgba(59,130,246,0.08)'
                : 'rgba(59,130,246,0.05)',
              border: isDark
                ? '1px solid rgba(59,130,246,0.20)'
                : '1px solid rgba(59,130,246,0.15)',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: 13,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              <strong>Note:</strong> When combining visibleWhen with RBAC, both
              conditions must be satisfied. The field shows only if UI logic
              returns true AND the user has required permissions.
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <DocsDivider />

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
            Form Integration
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Real-world scenarios with React Hook Form and dynamic visibility
          </Typography>
        </Box>
        <TextFieldScenarios />
      </Stack>

      <DocsDivider />

      {/* API Reference */}
      <DocsSection
        id="api"
        title="API Reference"
        description="Complete props and type definitions"
      >
        <TextFieldApi />
      </DocsSection>

      <DocsDivider />

      {/* Under the hood */}
      <DocsSection
        id="notes"
        title="Under the hood"
        description="How TextField behaves and why it works this way"
      >
        <TextFieldNotes />
      </DocsSection>
    </Stack>
  );
}
