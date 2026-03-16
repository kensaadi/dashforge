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
    <Stack spacing={6}>
      {/* Hero Section */}
      <Stack spacing={2.5}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: 32, md: 40 },
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          TextField
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: 17,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            maxWidth: 720,
          }}
        >
          TextField is an intelligent input component integrated with the
          Dashforge form system. Built on top of Material-UI TextField, it
          provides seamless form integration, automatic error handling, and
          predictable state management.
        </Typography>
      </Stack>

      {/* Quick Start */}
      <Stack spacing={3} id="quick-start">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 22, md: 26 },
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mb: 1,
            }}
          >
            Quick Start
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
              maxWidth: 680,
            }}
          >
            Get started with a basic TextField in seconds. Import the component
            and use it with or without a form.
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

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      {/* Examples Section */}
      <Stack spacing={3} id="examples">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 22, md: 26 },
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mb: 1,
            }}
          >
            Examples
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
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
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      {/* Layout Variants */}
      <Stack spacing={3} id="layout-variants">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 22, md: 26 },
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mb: 1,
            }}
          >
            Layout Variants
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
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
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      {/* Interactive Playground */}
      <Stack spacing={3} id="playground">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 22, md: 26 },
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mb: 1,
            }}
          >
            Interactive Playground
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
              maxWidth: 680,
            }}
          >
            Experiment with all TextField props and configurations in real-time.
          </Typography>
        </Box>
        <TextFieldPlayground />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      {/* Dashforge Capabilities */}
      <Stack spacing={3} id="capabilities">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 22, md: 26 },
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mb: 1,
            }}
          >
            Dashforge Capabilities
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
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
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      {/* Interactive Scenarios */}
      <Stack spacing={3} id="scenarios">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 22, md: 26 },
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mb: 1,
            }}
          >
            Interactive Form Scenarios
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
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
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      {/* API Reference */}
      <Stack spacing={3} id="api">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 22, md: 26 },
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mb: 1,
            }}
          >
            API
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
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
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      {/* Implementation Notes */}
      <Stack spacing={3} id="notes">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 22, md: 26 },
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mb: 1,
            }}
          >
            Implementation Notes
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
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
