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

      {/* Examples Section */}
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

      {/* Capabilities */}
      <DocsSection
        id="capabilities"
        title="Dashforge Capabilities"
        description="Progressive adoption from controlled components to predictive forms"
      >
        <TextFieldCapabilities />
      </DocsSection>

      {/* Access Control (RBAC) */}
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
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
              maxWidth: 720,
            }}
          >
            Control field visibility and interaction based on user permissions.
            Fields can be hidden, disabled, or set to readonly when users lack
            the required access. Integrates seamlessly with the Dashforge RBAC
            system.
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* Example 1: Hidden Field */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Hide field when user lacks permission
            </Typography>
            <DocsCodeBlock
              code={`<TextField
  name="salary"
  label="Salary"
  access={{
    resource: 'user.salary',
    action: 'read',
    onUnauthorized: 'hide',
  }}
/>`}
              language="tsx"
            />
          </Box>

          {/* Example 2: Disabled Field */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Disable field when user cannot edit
            </Typography>
            <DocsCodeBlock
              code={`<TextField
  name="status"
  label="Status"
  access={{
    resource: 'user.status',
    action: 'update',
    onUnauthorized: 'disable',
  }}
/>`}
              language="tsx"
            />
          </Box>

          {/* Example 3: Readonly Field */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Make field readonly when user has view-only access
            </Typography>
            <DocsCodeBlock
              code={`<TextField
  name="email"
  label="Email"
  access={{
    resource: 'user.email',
    action: 'update',
    onUnauthorized: 'readonly',
  }}
/>`}
              language="tsx"
            />
          </Box>

          {/* Example 4: Combination with visibleWhen */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Combine with visibleWhen for UI logic + permissions
            </Typography>
            <DocsCodeBlock
              code={`<TextField
  name="other"
  label="Other"
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
            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.55)'
                  : 'rgba(15,23,42,0.55)',
                mt: 1.5,
                fontStyle: 'italic',
              }}
            >
              Note: visibleWhen controls UI logic (show when category is
              "other"), while RBAC controls permissions (hide if user lacks
              access). Both conditions must be satisfied for the field to be
              visible.
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

      {/* Implementation Notes */}
      <DocsSection
        id="notes"
        title="Implementation Notes"
        description="Technical details and best practices"
      >
        <TextFieldNotes />
      </DocsSection>
    </Stack>
  );
}
