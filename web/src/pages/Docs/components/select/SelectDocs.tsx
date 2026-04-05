import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { SelectPlayground } from './SelectPlayground';
import { SelectExamples } from './SelectExamples';
import { SelectLayoutVariants } from './SelectLayoutVariants';
import { SelectCapabilities } from './SelectCapabilities';
import { SelectScenarios } from './SelectScenarios';
import { SelectApi } from './SelectApi';
import { SelectNotes } from './SelectNotes';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * SelectDocs is the main documentation page for the Select component
 * Displays title, description, examples, API reference, and implementation notes
 */
export function SelectDocs() {
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
          Select
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
          An intelligent dropdown component with seamless form integration,
          automatic error handling, and options-based API built on TextField.
        </Typography>
      </Stack>

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
            code={`import { Select } from '@dashforge/ui';

<Select 
  label="Country" 
  name="country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' }
  ]}
/>`}
            language="tsx"
          />
        </Stack>
      </Box>

      {/* Examples Section - Clean Demo List */}

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
            Common Select patterns and configurations
          </Typography>
        </Box>
        <SelectExamples />
      </Stack>

      {/* Layout Variants - Side-by-Side Comparison */}
      <Stack spacing={4} id="layout-variants">
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
            Layout Variants
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Floating, stacked, and inline label layouts
          </Typography>
        </Box>
        <SelectLayoutVariants />
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

        <SelectPlayground />
      </Stack>

      {/* Capabilities - Feature Grid */}
      <Stack spacing={4} id="capabilities">
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
            Dashforge Capabilities
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Progressive adoption from controlled components to predictive forms
          </Typography>
        </Box>
        <SelectCapabilities />
      </Stack>

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
            Control field visibility and interaction based on user permissions.
            Fields can be hidden, disabled, or set to readonly when users lack
            the required access. Integrates seamlessly with the Dashforge RBAC
            system.
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* Example 1: Hide */}
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
              code={`<Select
  name="department"
  label="Department"
  access={{
    resource: 'employee.department',
    action: 'edit',
    onUnauthorized: 'hide'
  }}
  options={[
    { value: 'engineering', label: 'Engineering' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' }
  ]}
/>

// Field hidden (returns null) when user lacks 'employee.department.edit' permission`}
              language="tsx"
            />
          </Box>

          {/* Example 2: Disable */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Disable field when user lacks permission
            </Typography>
            <DocsCodeBlock
              code={`<Select
  name="priority"
  label="Priority"
  access={{
    resource: 'project.priority',
    action: 'edit',
    onUnauthorized: 'disable'
  }}
  options={[
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ]}
/>

// Field disabled (grayed out, not focusable, excluded from submission)
// when user lacks 'project.priority.edit' permission`}
              language="tsx"
            />
          </Box>

          {/* Example 3: Readonly */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Set field to readonly when user lacks permission
            </Typography>
            <DocsCodeBlock
              code={`<Select
  name="status"
  label="Contract Status"
  access={{
    resource: 'contract.status',
    action: 'edit',
    onUnauthorized: 'readonly'
  }}
  options={[
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ]}
/>

// Note: Select becomes disabled when readonly (MUI select limitation)
// Value is still included in form submission
// when user lacks 'contract.status.edit' permission`}
              language="tsx"
            />
          </Box>

          {/* Example 4: Combined with visibleWhen */}
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
              code={`<Select
  name="orderType"
  label="Order Type"
  options={[
    { value: 'standard', label: 'Standard' },
    { value: 'expedited', label: 'Expedited' }
  ]}
/>

<Select
  name="expediteReason"
  label="Expedite Reason"
  visibleWhen={(engine) => engine.getValue('orderType') === 'expedited'}
  access={{
    resource: 'order.expedite',
    action: 'edit',
    onUnauthorized: 'readonly'
  }}
  options={[
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'inventory_issue', label: 'Inventory Issue' },
    { value: 'urgency', label: 'Business Urgency' }
  ]}
/>

// Field only appears when orderType is 'expedited' (UI logic)
// If visible but user lacks permission, field becomes readonly (RBAC logic)
// Both conditions are checked independently`}
              language="tsx"
            />
          </Box>
        </Stack>
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
        <SelectScenarios />
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
            Complete props and type definitions
          </Typography>
        </Box>
        <SelectApi />
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
            Technical details and best practices
          </Typography>
        </Box>
        <SelectNotes />
      </Stack>
    </Stack>
  );
}
