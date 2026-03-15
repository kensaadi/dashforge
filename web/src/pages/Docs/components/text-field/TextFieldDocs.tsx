import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useDashTheme } from '@dashforge/theme-core';
import { TextFieldPlayground } from './TextFieldPlayground';
import { TextFieldExamples } from './TextFieldExamples';
import { TextFieldCapabilities } from './TextFieldCapabilities';
import { TextFieldScenarios } from './TextFieldScenarios';
import { TextFieldApi } from './TextFieldApi';
import { TextFieldNotes } from './TextFieldNotes';
import { TextFieldDebug } from './TextFieldDebug';

/**
 * TextFieldDocs is the main documentation page for the TextField component
 * Displays title, description, examples, API reference, and implementation notes
 */
export function TextFieldDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={5}>
      <Stack spacing={2}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: 32, md: 40 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          TextField
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: 16,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            maxWidth: 700,
          }}
        >
          TextField is an intelligent input component integrated with the
          Dashforge form system. Built on top of Material-UI TextField, it
          provides seamless form integration, automatic error handling, and
          predictable state management.
        </Typography>
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      <TextFieldPlayground />

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      <Stack spacing={3}>
        <Typography
          id="debug"
          variant="h2"
          sx={{
            fontSize: { xs: 24, md: 28 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Debug Comparison
        </Typography>
        <TextFieldDebug />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      <Stack spacing={3}>
        <Typography
          id="examples"
          variant="h2"
          sx={{
            fontSize: { xs: 24, md: 28 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Examples
        </Typography>
        <TextFieldExamples />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      <Stack spacing={3}>
        <Typography
          id="capabilities"
          variant="h2"
          sx={{
            fontSize: { xs: 24, md: 28 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Dashforge Capabilities
        </Typography>
        <TextFieldCapabilities />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      <Stack spacing={3}>
        <Typography
          id="scenarios"
          variant="h2"
          sx={{
            fontSize: { xs: 24, md: 28 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Interactive Form Scenarios
        </Typography>
        <TextFieldScenarios />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      <Stack spacing={3}>
        <Typography
          id="api"
          variant="h2"
          sx={{
            fontSize: { xs: 24, md: 28 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          API
        </Typography>
        <TextFieldApi />
      </Stack>

      <Divider
        sx={{
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)',
        }}
      />

      <Stack spacing={3}>
        <Typography
          id="notes"
          variant="h2"
          sx={{
            fontSize: { xs: 24, md: 28 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Notes
        </Typography>
        <TextFieldNotes />
      </Stack>
    </Stack>
  );
}
