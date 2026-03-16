import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { TextField } from '@dashforge/ui';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { TextFieldPlayground } from './TextFieldPlayground';
import { TextFieldExamples } from './TextFieldExamples';
import { TextFieldLayoutVariants } from './TextFieldLayoutVariants';
import { TextFieldCapabilities } from './TextFieldCapabilities';
import { TextFieldScenarios } from './TextFieldScenarios';
import { TextFieldApi } from './TextFieldApi';
import { TextFieldNotes } from './TextFieldNotes';

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
      <Stack spacing={2.5}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: 36, md: 48 },
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: isDark ? '#ffffff' : '#0f172a',
            background: isDark
              ? 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          TextField
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: 18,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            maxWidth: 760,
          }}
        >
          TextField is an intelligent input component integrated with the
          Dashforge form system. Built on top of Material-UI TextField, it
          provides seamless form integration, automatic error handling, and
          predictable state management.
        </Typography>
      </Stack>

      {/* Quick Start - Visually Prominent */}
      <Box
        id="quick-start"
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(79,70,229,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(124,58,237,0.05) 100%)',
          border: isDark
            ? '2px solid rgba(139,92,246,0.30)'
            : '2px solid rgba(139,92,246,0.25)',
          boxShadow: isDark
            ? '0 8px 32px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.08)'
            : '0 4px 24px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.5)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: isDark
              ? 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)'
              : 'linear-gradient(90deg, #7c3aed 0%, #6366f1 100%)',
          },
        }}
      >
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: 2,
                bgcolor: isDark
                  ? 'rgba(139,92,246,0.20)'
                  : 'rgba(139,92,246,0.15)',
                border: isDark
                  ? '1px solid rgba(139,92,246,0.40)'
                  : '1px solid rgba(139,92,246,0.30)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: isDark ? '#c4b5fd' : '#7c3aed',
                }}
              >
                Start Here
              </Typography>
            </Box>
          </Stack>

          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: 24, md: 30 },
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Quick Start
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: 16,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
                maxWidth: 680,
              }}
            >
              Get started with a basic TextField in seconds. Import the
              component and use it with or without a form.
            </Typography>
          </Box>

          <DocsPreviewBlock
            code={`import { TextField } from '@dashforge/ui';

function MyForm() {
  return (
    <TextField 
      label="Email" 
      name="email"
      helperText="We'll never share your email"
    />
  );
}`}
          >
            <TextField
              label="Email"
              name="email"
              helperText="We'll never share your email"
            />
          </DocsPreviewBlock>
        </Stack>
      </Box>

      {/* Examples Section */}
      <Stack spacing={4} id="examples">
        <Box
          sx={{
            pl: 3,
            borderLeft: isDark
              ? '4px solid rgba(139,92,246,0.30)'
              : '4px solid rgba(139,92,246,0.25)',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 26, md: 32 },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 1.5,
            }}
          >
            Examples
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 16,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              maxWidth: 680,
            }}
          >
            Explore common TextField patterns including disabled states, error
            handling, and full-width layouts.
          </Typography>
        </Box>
        <TextFieldExamples />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.10)'
            : 'rgba(15,23,42,0.10)',
          my: 2,
        }}
      />

      {/* Layout Variants */}
      <Stack spacing={4} id="layout-variants">
        <Box
          sx={{
            pl: 3,
            borderLeft: isDark
              ? '4px solid rgba(59,130,246,0.30)'
              : '4px solid rgba(59,130,246,0.25)',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 26, md: 32 },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 1.5,
            }}
          >
            Layout Variants
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 16,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              maxWidth: 680,
            }}
          >
            Choose between floating, stacked, and inline label layouts to match
            your design system.
          </Typography>
        </Box>
        <TextFieldLayoutVariants />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.10)'
            : 'rgba(15,23,42,0.10)',
          my: 2,
        }}
      />

      {/* Interactive Playground - Contained */}
      <Box
        id="playground"
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(248,250,252,0.80)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(15,23,42,0.08)',
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.20)'
            : '0 2px 16px rgba(15,23,42,0.06)',
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: 24, md: 28 },
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Interactive Playground
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: 15,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.65)'
                  : 'rgba(15,23,42,0.65)',
                maxWidth: 680,
              }}
            >
              Experiment with all TextField props and configurations in
              real-time.
            </Typography>
          </Box>
          <TextFieldPlayground />
        </Stack>
      </Box>

      {/* Dashforge Capabilities */}
      <Stack spacing={4} id="capabilities">
        <Box
          sx={{
            pl: 3,
            borderLeft: isDark
              ? '4px solid rgba(34,197,94,0.30)'
              : '4px solid rgba(34,197,94,0.25)',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 26, md: 32 },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 1.5,
            }}
          >
            Dashforge Capabilities
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 16,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              maxWidth: 680,
            }}
          >
            Discover advanced features unique to Dashforge TextField including
            automatic form integration and intelligent error handling.
          </Typography>
        </Box>
        <TextFieldCapabilities />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.10)'
            : 'rgba(15,23,42,0.10)',
          my: 2,
        }}
      />

      {/* Interactive Scenarios */}
      <Stack spacing={4} id="scenarios">
        <Box
          sx={{
            pl: 3,
            borderLeft: isDark
              ? '4px solid rgba(249,115,22,0.30)'
              : '4px solid rgba(249,115,22,0.25)',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 26, md: 32 },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 1.5,
            }}
          >
            Interactive Form Scenarios
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 16,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              maxWidth: 680,
            }}
          >
            See TextField in action with React Hook Form integration and dynamic
            field visibility.
          </Typography>
        </Box>
        <TextFieldScenarios />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.10)'
            : 'rgba(15,23,42,0.10)',
          my: 2,
        }}
      />

      {/* API Reference */}
      <Stack spacing={4} id="api">
        <Box
          sx={{
            pl: 3,
            borderLeft: isDark
              ? '4px solid rgba(236,72,153,0.30)'
              : '4px solid rgba(236,72,153,0.25)',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 26, md: 32 },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 1.5,
            }}
          >
            API
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 16,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              maxWidth: 680,
            }}
          >
            Complete reference of TextField props, types, and behaviors.
          </Typography>
        </Box>
        <TextFieldApi />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.10)'
            : 'rgba(15,23,42,0.10)',
          my: 2,
        }}
      />

      {/* Implementation Notes */}
      <Stack spacing={4} id="notes">
        <Box
          sx={{
            pl: 3,
            borderLeft: isDark
              ? '4px solid rgba(168,85,247,0.30)'
              : '4px solid rgba(168,85,247,0.25)',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 26, md: 32 },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 1.5,
            }}
          >
            Implementation Notes
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 16,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              maxWidth: 680,
            }}
          >
            Important technical details, best practices, and migration guidance.
          </Typography>
        </Box>
        <TextFieldNotes />
      </Stack>
    </Stack>
  );
}
