import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { Link as RouterLink } from 'react-router-dom';
import { DocsCodeBlock } from '../components/shared/CodeBlock';
import { InstallTabs } from '../components/shared/InstallTabs';

/**
 * Installation - Practical guide for installing Dashforge
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
          Install Dashforge and its dependencies. Takes about 2 minutes.
        </Typography>
      </Stack>

      {/* Prerequisites */}
      <Stack spacing={4} id="prerequisites">
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
            Prerequisites
          </Typography>
        </Box>

        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(17,24,39,0.35)' : 'rgba(248,250,252,0.80)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(15,23,42,0.08)',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{
              '& > *': { flex: 1 },
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.55)'
                    : 'rgba(15,23,42,0.55)',
                  mb: 0.5,
                }}
              >
                Node.js
              </Typography>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: isDark
                    ? 'rgba(255,255,255,0.85)'
                    : 'rgba(15,23,42,0.85)',
                }}
              >
                18+
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.55)'
                    : 'rgba(15,23,42,0.55)',
                  mb: 0.5,
                }}
              >
                React
              </Typography>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: isDark
                    ? 'rgba(255,255,255,0.85)'
                    : 'rgba(15,23,42,0.85)',
                }}
              >
                19
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.55)'
                    : 'rgba(15,23,42,0.55)',
                  mb: 0.5,
                }}
              >
                TypeScript
              </Typography>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: isDark
                    ? 'rgba(255,255,255,0.85)'
                    : 'rgba(15,23,42,0.85)',
                }}
              >
                5.0+
              </Typography>
            </Box>
          </Stack>
        </Box>
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

        <InstallTabs packages={['@dashforge/ui']} />
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
            Required for Material UI components
          </Typography>
        </Box>

        <InstallTabs
          packages={['@mui/material', '@emotion/react', '@emotion/styled']}
        />
      </Stack>

      {/* Verify Installation */}
      <Stack spacing={4} id="verification">
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
            3. Verify installation
          </Typography>
        </Box>

        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Test that Dashforge imports work:
          </Typography>

          <DocsCodeBlock
            code={`import { TextField } from '@dashforge/ui';

function Example() {
  return <TextField label="Name" />;
}

// If this compiles without errors, you're ready.`}
            language="tsx"
          />
        </Stack>
      </Stack>

      {/* Next Steps */}
      <Stack spacing={3}>
        <Box
          sx={{
            p: 3,
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
              fontSize: 18,
              fontWeight: 700,
              color: isDark ? 'rgba(139,92,246,0.95)' : 'rgba(109,40,217,0.95)',
              mb: 1.5,
            }}
          >
            Next: Build Your First Form →
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Continue to the{' '}
            <Box
              component={RouterLink}
              to="/docs/getting-started/usage"
              sx={{
                color: isDark
                  ? 'rgba(139,92,246,0.95)'
                  : 'rgba(109,40,217,0.95)',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Usage Guide
            </Box>{' '}
            to build a form with validation and conditional fields.
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
