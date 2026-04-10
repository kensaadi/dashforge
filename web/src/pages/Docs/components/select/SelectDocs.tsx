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
import { DocsRelatedSection } from '../shared';

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
              code={`<Select
  name="department"
  label="Department"
  access={{
    resource: 'employee.department',
    action: 'edit',
    onUnauthorized: 'hide'
  }}
  options={[
    { value: 'eng', label: 'Engineering' },
    { value: 'sales', label: 'Sales' }
  ]}
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
    { value: 'high', label: 'High' }
  ]}
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
              code={`<Select
  name="status"
  label="Status"
  access={{
    resource: 'contract.status',
    action: 'edit',
    onUnauthorized: 'readonly'
  }}
  options={[
    { value: 'draft', label: 'Draft' },
    { value: 'approved', label: 'Approved' }
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
              code={`<Select
  name="expediteReason"
  label="Expedite Reason"
  visibleWhen={(e) => 
    e.getValue('type') === 'expedited'
  }
  access={{
    resource: 'order.expedite',
    action: 'edit',
    onUnauthorized: 'readonly'
  }}
  options={[
    { value: 'urgent', label: 'Urgent' }
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
            conditions must be satisfied. The field shows only if UI logic
            returns true AND the user has required permissions.
          </Typography>
        </Box>
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
            How Select works internally
          </Typography>
        </Box>
        <SelectNotes />
      </Stack>

      <Divider sx={{ my: 6 }} />

      {/* Related Topics */}
      <DocsRelatedSection
        links={[
          {
            label: 'TextField',
            path: '/docs/components/text-field',
            description: 'Text input component',
          },
          {
            label: 'Autocomplete',
            path: '/docs/components/autocomplete',
            description: 'Searchable dropdown with async support',
          },
          {
            label: 'RadioGroup',
            path: '/docs/components/radio-group',
            description: 'Radio button selection',
          },
          {
            label: 'Form System Quick Start',
            path: '/docs/form-system/quick-start',
            description: 'Build your first dynamic form',
          },
          {
            label: 'Reactions',
            path: '/docs/form-system/reactions',
            description: 'Dynamic behavior with reactions',
          },
        ]}
      />
    </Stack>
  );
}
