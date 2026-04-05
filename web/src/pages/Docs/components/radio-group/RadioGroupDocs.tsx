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

      {/* Access Control (RBAC) - Permission-Based Rendering */}
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
            RadioGroup supports RBAC at two distinct levels: group-level access
            controls the entire field, while option-level access controls
            individual radio choices. Group-level access has precedence over
            option-level access.
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* Example 1: Group hidden */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Hide entire group when user lacks permission
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
/>

// Entire group hidden (returns null) when user lacks 'user.role.read' permission`}
              language="tsx"
            />
          </Box>

          {/* Example 2: Group readonly/disable fallback */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Set entire group to readonly when user lacks permission
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
    { value: 'editor', label: 'Editor' },
    { value: 'admin', label: 'Admin' }
  ]}
/>

// Note: RadioGroup becomes disabled when readonly (radio groups lack native readonly semantics)
// All options are non-interactive, but visible
// Value is still included in form submission
// when user lacks 'user.role.update' permission`}
              language="tsx"
            />
          </Box>

          {/* Example 3: Option-level access */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Restrict specific options based on permission
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
/>

// Admin option is visible but not selectable when user lacks 'user.role.admin.assign' permission
// Viewer and Editor options remain fully interactive`}
              language="tsx"
            />
          </Box>

          {/* Example 4: Hidden selected option edge case */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Selected option remains visible even when hidden
            </Typography>
            <DocsCodeBlock
              code={`// Current value: 'admin'
// Admin option has onUnauthorized: 'hide'
// User loses permission to see admin option

<RadioGroup
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
        action: 'view',
        onUnauthorized: 'hide'
      }
    }
  ]}
/>

// Critical edge case: If 'admin' is the currently selected value,
// it remains visible but disabled (non-selectable)
// This prevents the current value from disappearing from the UI
// User can see what is selected but cannot select it again`}
              language="tsx"
            />
          </Box>

          {/* Example 5: Combined with visibleWhen */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Combine access control with conditional visibility
            </Typography>
            <DocsCodeBlock
              code={`<RadioGroup
  name="accountType"
  label="Account Type"
  options={[
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' }
  ]}
/>

<RadioGroup
  name="businessType"
  label="Business Type"
  visibleWhen={(engine) => engine.getValue('accountType') === 'business'}
  access={{
    resource: 'account.businessType',
    action: 'edit',
    onUnauthorized: 'readonly'
  }}
  options={[
    { value: 'sole-proprietor', label: 'Sole Proprietor' },
    { value: 'llc', label: 'LLC' },
    {
      value: 'corporation',
      label: 'Corporation',
      access: {
        resource: 'account.businessType.corporation',
        action: 'assign',
        onUnauthorized: 'hide'
      }
    }
  ]}
/>

// businessType field only appears when accountType is 'business' (UI logic)
// If visible but user lacks permission, field becomes disabled (group-level RBAC)
// Corporation option hidden unless user has specific permission (option-level RBAC)
// All three conditions are checked independently`}
              language="tsx"
            />
          </Box>
        </Stack>

        {/* Adoption Guidance */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.06)',
            border: isDark
              ? '1px solid rgba(251,191,36,0.25)'
              : '1px solid rgba(251,191,36,0.20)',
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: isDark ? '#fbbf24' : '#d97706',
              mb: 2,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Adoption Guidance
          </Typography>
          <Stack spacing={1.5}>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.80)'
                  : 'rgba(15,23,42,0.80)',
              }}
            >
              • Use <strong>group-level access</strong> to control the field as
              a whole (visibility, editability)
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.80)'
                  : 'rgba(15,23,42,0.80)',
              }}
            >
              • Use <strong>option-level access</strong> to restrict specific
              choices based on granular permissions
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.80)'
                  : 'rgba(15,23,42,0.80)',
              }}
            >
              • Remember that{' '}
              <strong>readonly on RadioGroup falls back to disabled</strong> (no
              native readonly support)
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.80)'
                  : 'rgba(15,23,42,0.80)',
              }}
            >
              • If an option may be hidden dynamically,{' '}
              <strong>
                the selected-value visibility rule ensures current values remain
                visible
              </strong>
            </Typography>
          </Stack>
        </Box>

        {/* Edge Case Guidance */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)',
            border: isDark
              ? '1px solid rgba(239,68,68,0.25)'
              : '1px solid rgba(239,68,68,0.20)',
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: isDark ? '#f87171' : '#dc2626',
              mb: 2,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Edge Cases
          </Typography>
          <Stack spacing={1.5}>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.80)'
                  : 'rgba(15,23,42,0.80)',
              }}
            >
              • <strong>Group access has precedence over option access</strong>:
              if group is disabled, all options are non-interactive
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.80)'
                  : 'rgba(15,23,42,0.80)',
              }}
            >
              •{' '}
              <strong>
                Hidden selected options remain visible but disabled
              </strong>
              : prevents current value from disappearing
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.80)'
                  : 'rgba(15,23,42,0.80)',
              }}
            >
              •{' '}
              <strong>
                Option-level readonly behaves as disabled fallback
              </strong>
              : radio options lack native readonly semantics
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.80)'
                  : 'rgba(15,23,42,0.80)',
              }}
            >
              •{' '}
              <strong>Group-level readonly behaves as disabled fallback</strong>
              : radio groups lack native readonly semantics
            </Typography>
          </Stack>
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
