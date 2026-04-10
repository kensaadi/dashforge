import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../shared/CodeBlock';
import { AutocompleteExamples } from './AutocompleteExamples';
import { AutocompleteLayoutVariants } from './AutocompleteLayoutVariants';
import { AutocompletePlayground } from './AutocompletePlayground';
import { AutocompleteCapabilities } from './AutocompleteCapabilities';
import { AutocompleteScenarios } from './AutocompleteScenarios';
import { AutocompleteApi } from './AutocompleteApi';
import { AutocompleteNotes } from './AutocompleteNotes';

/**
 * AutocompleteDocs is the main documentation page for the Autocomplete component
 */
export function AutocompleteDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
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
          Autocomplete
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
          An enhanced select input with search and free-text capabilities.
          Always in freeSolo mode, fully integrated with DashForm and Reactive
          V2.
        </Typography>
      </Stack>

      {/* Quick Start */}
      <Box
        id="quick-start"
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
          border: isDark
            ? '1px solid rgba(139,92,246,0.20)'
            : '1px solid rgba(139,92,246,0.15)',
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
            code={`import { Autocomplete } from '@dashforge/ui';

<Autocomplete 
  name="country"
  label="Country"
  options={['USA', 'Canada', 'Mexico']}
/>`}
            language="tsx"
          />
        </Stack>
      </Box>

      {/* Examples */}
      <Stack spacing={4} id="examples">
        <Stack spacing={1.5}>
          <Typography
            variant="h2"
            sx={{
              fontSize: 32,
              fontWeight: 700,
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            }}
          >
            Examples
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Common usage patterns and real-world examples.
          </Typography>
        </Stack>
        <AutocompleteExamples />
      </Stack>

      <Divider sx={{ opacity: 0.1 }} />

      {/* Layout Variants */}
      <Stack spacing={4} id="layout-variants">
        <Stack spacing={1.5}>
          <Typography
            variant="h2"
            sx={{
              fontSize: 32,
              fontWeight: 700,
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            }}
          >
            Layout Variants
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Visual appearance options.
          </Typography>
        </Stack>
        <AutocompleteLayoutVariants />
      </Stack>

      <Divider sx={{ opacity: 0.1 }} />

      {/* Playground */}
      <Stack spacing={4} id="playground">
        <Stack spacing={1.5}>
          <Typography
            variant="h2"
            sx={{
              fontSize: 32,
              fontWeight: 700,
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            }}
          >
            Playground
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Interactive demo with live code preview.
          </Typography>
        </Stack>
        <AutocompletePlayground />
      </Stack>

      <Divider sx={{ opacity: 0.1 }} />

      {/* Capabilities */}
      <Stack spacing={4} id="capabilities">
        <Stack spacing={1.5}>
          <Typography
            variant="h2"
            sx={{
              fontSize: 32,
              fontWeight: 700,
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            }}
          >
            Capabilities
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Dashforge-specific features and integrations.
          </Typography>
        </Stack>
        <AutocompleteCapabilities />
      </Stack>

      <Divider sx={{ opacity: 0.1 }} />

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
            Fields can be hidden, disabled, or readonly when users lack access.
          </Typography>
        </Box>

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
              code={`<Autocomplete
  name="assignee"
  label="Assignee"
  access={{
    resource: 'task.assignee',
    action: 'edit',
    onUnauthorized: 'hide'
  }}
  options={[
    { value: 'alice', label: 'Alice' },
    { value: 'bob', label: 'Bob' }
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
              code={`<Autocomplete
  name="status"
  label="Status"
  access={{
    resource: 'task.status',
    action: 'update',
    onUnauthorized: 'disable'
  }}
  options={[
    { value: 'open', label: 'Open' },
    { value: 'done', label: 'Done' }
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
              code={`<Autocomplete
  name="category"
  label="Category"
  access={{
    resource: 'product.category',
    action: 'update',
    onUnauthorized: 'readonly'
  }}
  options={[
    { value: 'electronics', label: 'Electronics' },
    { value: 'books', label: 'Books' }
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
              code={`<Autocomplete
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

      <Divider sx={{ opacity: 0.1 }} />

      {/* Scenarios */}
      <Stack spacing={4} id="scenarios">
        <Stack spacing={1.5}>
          <Typography
            variant="h2"
            sx={{
              fontSize: 32,
              fontWeight: 700,
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            }}
          >
            Scenarios
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Real-world use cases and patterns.
          </Typography>
        </Stack>
        <AutocompleteScenarios />
      </Stack>

      <Divider sx={{ opacity: 0.1 }} />

      {/* API Reference */}
      <Stack spacing={4} id="api">
        <Stack spacing={1.5}>
          <Typography
            variant="h2"
            sx={{
              fontSize: 32,
              fontWeight: 700,
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            }}
          >
            API Reference
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Complete props documentation.
          </Typography>
        </Stack>
        <AutocompleteApi />
      </Stack>

      <Divider sx={{ opacity: 0.1 }} />

      {/* Under the hood */}
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
            How Autocomplete works internally
          </Typography>
        </Box>
        <AutocompleteNotes />
      </Stack>
    </Stack>
  );
}
