import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { NumberFieldPlayground } from './NumberFieldPlayground';
import { NumberFieldExamples } from './NumberFieldExamples';
import { NumberFieldLayoutVariants } from './NumberFieldLayoutVariants';
import { NumberFieldCapabilities } from './NumberFieldCapabilities';
import { NumberFieldScenarios } from './NumberFieldScenarios';
import { NumberFieldApi } from './NumberFieldApi';
import { NumberFieldNotes } from './NumberFieldNotes';

/**
 * NumberFieldDocs is the main documentation page for the NumberField component
 * Displays title, description, examples, API reference, and implementation notes
 */
export function NumberFieldDocs() {
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
          NumberField
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
          A specialized numeric input component built on MUI TextField.
          Provides built-in parsing (controlled value is number | null, never
          NaN), min/max constraints, and step increments. Supports standalone
          usage and seamless DashForm integration with automatic field binding
          and validation. Includes reactive visibility for conditional
          rendering.
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

          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2.5,
              borderRadius: 1.5,
              fontSize: 14,
              lineHeight: 1.7,
              fontFamily: '"Fira Code", "SF Mono", Menlo, monospace',
              color: isDark ? '#e5e7eb' : '#1f2937',
              bgcolor: isDark ? 'rgba(0,0,0,0.30)' : 'rgba(248,250,252,0.80)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(15,23,42,0.08)',
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: 6,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: isDark
                  ? 'rgba(255,255,255,0.15)'
                  : 'rgba(15,23,42,0.20)',
                borderRadius: 1,
              },
            }}
          >
            {`import { NumberField } from '@dashforge/ui';

<NumberField label="Amount" name="amount" />`}
          </Box>
        </Stack>
      </Box>

      {/* Examples Section */}
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
            Common NumberField patterns and numeric input configurations
          </Typography>
        </Box>
        <NumberFieldExamples />
      </Stack>

      {/* Layout Variants */}
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
        <NumberFieldLayoutVariants />
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
            Experiment with numeric input props and see live results
          </Typography>
        </Box>

        <NumberFieldPlayground />
      </Stack>

      {/* Capabilities */}
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
            Built-in numeric handling with consistent layout behavior
          </Typography>
        </Box>
        <NumberFieldCapabilities />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
          my: 4,
        }}
      />

      {/* Integration Scenarios */}
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
            Real-world scenarios with numeric validation and boundaries
          </Typography>
        </Box>
        <NumberFieldScenarios />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
          my: 4,
        }}
      />

      {/* API Reference */}
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
        <NumberFieldApi />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
          my: 4,
        }}
      />

      {/* Implementation Notes */}
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
            Technical details and best practices for numeric inputs
          </Typography>
        </Box>
        <NumberFieldNotes />
      </Stack>
    </Stack>
  );
}
