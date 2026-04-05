import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { Link as RouterLink } from 'react-router-dom';
import { DocsCodeBlock } from '../components/shared/CodeBlock';
import { InstallTabs } from '../components/shared/InstallTabs';

/**
 * Installation - Zero-friction onboarding for Dashforge
 */
export function Installation() {
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
          Installation
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: 20,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            maxWidth: 720,
          }}
        >
          Three steps. Two minutes. One working form.
        </Typography>
      </Stack>

      {/* Install Dashforge */}
      <Stack spacing={4} id="installation">
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
            1. Install Dashforge
          </Typography>
        </Box>

        <InstallTabs packages={['@dashforge/ui', '@dashforge/forms']} />
      </Stack>

      {/* Install Peer Dependencies */}
      <Stack spacing={4} id="peer-dependencies">
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
            2. Install peer dependencies
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Material UI and Emotion
          </Typography>
        </Box>

        <InstallTabs
          packages={['@mui/material', '@emotion/react', '@emotion/styled']}
        />
      </Stack>

      {/* Minimal Working Example */}
      <Stack spacing={4} id="first-form">
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
            3. Your first form
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Copy this into a component to verify everything works
          </Typography>
        </Box>

        <Stack spacing={3}>
          <DocsCodeBlock
            code={`import { DashForm } from '@dashforge/forms';
import { Select, TextField } from '@dashforge/ui';

function SupportForm() {
  const handleSubmit = (data) => {
    console.log(data);
  };

  return (
    <DashForm onSubmit={handleSubmit}>
      <Select
        name="category"
        label="Category"
        options={[
          { value: 'bug', label: 'Bug Report' },
          { value: 'feature', label: 'Feature Request' },
        ]}
      />

      <TextField
        name="details"
        label="Details"
        visibleWhen={(engine) =>
          engine.getNode('category')?.value === 'bug'
        }
      />

      <button type="submit">Submit</button>
    </DashForm>
  );
}`}
            language="tsx"
          />

          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderRadius: 1.5,
              bgcolor: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)',
              border: isDark
                ? '1px solid rgba(34,197,94,0.20)'
                : '1px solid rgba(34,197,94,0.15)',
            }}
          >
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.6,
                color: isDark ? 'rgba(34,197,94,0.90)' : 'rgba(22,163,74,0.95)',
                fontWeight: 500,
              }}
            >
              ✓ If this renders, Dashforge is installed correctly.
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {/* Prerequisites */}
      <Stack spacing={4} id="prerequisites">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 24, md: 28 },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              mb: 1.5,
            }}
          >
            Prerequisites
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)',
            }}
          >
            Node.js 18+, React 19, TypeScript 5.0+
          </Typography>
        </Box>
      </Stack>

      {/* Next Steps */}
      <Stack spacing={3}>
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(139,92,246,0.10)' : 'rgba(139,92,246,0.06)',
            border: isDark
              ? '1px solid rgba(139,92,246,0.25)'
              : '1px solid rgba(139,92,246,0.18)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: 20,
              fontWeight: 700,
              color: isDark ? 'rgba(139,92,246,0.95)' : 'rgba(109,40,217,0.95)',
              mb: 1.5,
            }}
          >
            You're ready to build
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              mb: 2.5,
            }}
          >
            Now that Dashforge is installed, learn how to build real forms with
            validation, conditional fields, and dynamic behavior.
          </Typography>
          <Box
            component={RouterLink}
            to="/docs/getting-started/usage"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 2.5,
              py: 1.25,
              borderRadius: 1.5,
              bgcolor: isDark
                ? 'rgba(139,92,246,0.15)'
                : 'rgba(139,92,246,0.12)',
              border: isDark
                ? '1px solid rgba(139,92,246,0.30)'
                : '1px solid rgba(139,92,246,0.20)',
              color: isDark ? 'rgba(139,92,246,0.95)' : 'rgba(109,40,217,0.95)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: isDark
                  ? 'rgba(139,92,246,0.20)'
                  : 'rgba(139,92,246,0.18)',
                borderColor: isDark
                  ? 'rgba(139,92,246,0.40)'
                  : 'rgba(139,92,246,0.30)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Usage Guide →
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
}
