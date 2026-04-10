import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsHeroSection, DocsSection, DocsDivider } from '../shared';
import { SwitchExamples } from './SwitchExamples';
import { SwitchCapabilities } from './SwitchCapabilities';
import { SwitchScenarios } from './SwitchScenarios';
import { SwitchApi } from './SwitchApi';
import { SwitchNotes } from './SwitchNotes';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * SwitchDocs is the main documentation page for the Switch component
 * Displays title, description, examples, API reference, and implementation notes
 */
export function SwitchDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="Switch"
        description="An intelligent binary toggle component built on MUI Switch. Ideal for on/off state controls like feature toggles, preferences, notifications, and settings. Supports standalone usage, seamless DashForm integration with automatic field binding, validation error gating, and reactive visibility."
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
            code={`import { Switch } from '@dashforge/ui';

<Switch label="Enable notifications" name="notifications" />`}
            language="tsx"
          />
        </Stack>
      </Box>

      {/* Examples Section */}
      <DocsSection
        id="examples"
        title="Examples"
        description="Common Switch patterns and configurations"
      >
        <SwitchExamples />
      </DocsSection>

      {/* Capabilities */}
      <DocsSection
        id="capabilities"
        title="Dashforge Capabilities"
        description="Progressive adoption from controlled components to predictive forms"
      >
        <SwitchCapabilities />
      </DocsSection>

      <DocsDivider />

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
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
              maxWidth: 720,
            }}
          >
            Control field visibility and interaction based on user permissions.
            Fields can be hidden, disabled, or readonly when users lack access.
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
              code={`<Switch
  name="featureEnabled"
  label="Feature Enabled"
  access={{
    resource: 'feature.toggle',
    action: 'edit',
    onUnauthorized: 'hide'
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
              code={`<Switch
  name="isPublished"
  label="Published"
  access={{
    resource: 'article.publish',
    action: 'update',
    onUnauthorized: 'disable'
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
              code={`<Switch
  name="emailNotifications"
  label="Email Notifications"
  access={{
    resource: 'user.notifications.email',
    action: 'update',
    onUnauthorized: 'readonly'
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
              code={`<Switch
  name="requiresApproval"
  label="Requires Approval"
  visibleWhen={(e) => 
    e.getValue('workflowType') === true
  }
  access={{
    resource: 'workflow.approval',
    action: 'edit',
    onUnauthorized: 'readonly'
  }}
/>`}
              language="tsx"
            />
          </Box>
        </Box>

        {/* Compact Info Box */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.20)'
              : '1px solid rgba(59,130,246,0.15)',
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(15,23,42,0.80)',
            }}
          >
            <strong>Note:</strong> When combining visibleWhen with RBAC, both
            conditions must be satisfied. The field shows only if UI logic
            returns true AND the user has required permissions.
          </Typography>
        </Box>
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
        <SwitchScenarios />
      </Stack>

      <DocsDivider />

      {/* API Reference */}
      <DocsSection
        id="api"
        title="API Reference"
        description="Complete props and type definitions"
      >
        <SwitchApi />
      </DocsSection>

      <DocsDivider />

      {/* Under the hood - Info Cards */}
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
            Under the hood
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            How Switch works internally
          </Typography>
        </Box>
        <SwitchNotes />
      </Stack>
    </Stack>
  );
}
