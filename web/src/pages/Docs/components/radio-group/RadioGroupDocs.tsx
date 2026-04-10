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
            RadioGroup supports RBAC at two levels: group-level access controls
            the entire field, while option-level access controls individual
            choices. Group-level access has precedence.
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
          {/* Pattern 1: Hide entire group */}
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
              code={`<RadioGroup
  name="role"
  label="Role"
  access={{
    resource: 'user.role',
    action: 'read',
    onUnauthorized: 'hide'
  }}
  options={[
    { value: 'viewer', label: 'Viewer' },
    { value: 'editor', label: 'Editor' }
  ]}
/>`}
              language="tsx"
            />
          </Box>

          {/* Pattern 2: Disable entire group */}
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
              code={`<RadioGroup
  name="role"
  label="Role"
  access={{
    resource: 'user.role',
    action: 'update',
    onUnauthorized: 'readonly'
  }}
  options={[
    { value: 'viewer', label: 'Viewer' },
    { value: 'editor', label: 'Editor' }
  ]}
/>

// Note: RadioGroup becomes disabled when readonly`}
              language="tsx"
            />
          </Box>

          {/* Pattern 3: Option-level access */}
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
              Restrict specific options
            </Typography>
            <DocsCodeBlock
              code={`<RadioGroup
  name="role"
  label="Role"
  options={[
    { value: 'viewer', label: 'Viewer' },
    { value: 'editor', label: 'Editor' },
    {
      value: 'admin',
      label: 'Admin',
      access: {
        resource: 'user.role.admin',
        action: 'assign',
        onUnauthorized: 'disable'
      }
    }
  ]}
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
              code={`<RadioGroup
  name="businessType"
  label="Business Type"
  visibleWhen={(e) => 
    e.getValue('accountType') === 'business'
  }
  access={{
    resource: 'account.businessType',
    action: 'edit',
    onUnauthorized: 'readonly'
  }}
  options={[
    { value: 'llc', label: 'LLC' },
    { value: 'corp', label: 'Corporation' }
  ]}
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
            conditions must be satisfied. RadioGroup becomes disabled when
            readonly (no native readonly support). If a hidden option is
            selected, it remains visible but disabled.
          </Typography>
        </Box>
      </Stack>

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

      {/* Under the hood - Info Cards */}
      <DocsSection
        id="notes"
        title="Under the hood"
        description="How RadioGroup works internally"
      >
        <RadioGroupNotes />
      </DocsSection>

      <DocsDivider />

      {/* Related Topics */}
      <DocsRelatedSection
        links={[
          {
            label: 'Select',
            path: '/docs/components/select',
            description: 'Dropdown selection component',
          },
          {
            label: 'Checkbox',
            path: '/docs/components/checkbox',
            description: 'Checkbox selection component',
          },
          {
            label: 'Form System Quick Start',
            path: '/docs/form-system/quick-start',
            description: 'Build your first form',
          },
        ]}
      />
    </Stack>
  );
}
