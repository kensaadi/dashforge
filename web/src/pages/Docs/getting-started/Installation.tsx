import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { Link as RouterLink } from 'react-router-dom';
import { DocsCodeBlock } from '../components/shared/CodeBlock';
import { InstallTabs } from '../components/shared/InstallTabs';

/**
 * Installation - Guide for installing Dashforge and its dependencies
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
            fontSize: 19,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            maxWidth: 720,
          }}
        >
          Install Dashforge and its required peer dependencies to start building
          applications.
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
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Required environment for running Dashforge
          </Typography>
        </Box>

        <Box
          component="ul"
          sx={{
            p: 3,
            pl: 5,
            m: 0,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(17,24,39,0.35)' : 'rgba(248,250,252,0.80)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(15,23,42,0.08)',
            listStyleType: 'disc',
          }}
        >
          <Box
            component="li"
            sx={{
              fontSize: 16,
              lineHeight: 2,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            <strong>Node.js 18+</strong>
          </Box>
          <Box
            component="li"
            sx={{
              fontSize: 16,
              lineHeight: 2,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            <strong>React 18+</strong>
          </Box>
          <Box
            component="li"
            sx={{
              fontSize: 16,
              lineHeight: 2,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            <strong>Material UI peer dependencies</strong>
          </Box>
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
            Install Dashforge
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Install the core UI framework
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
            Install the main Dashforge UI package using your preferred package
            manager:
          </Typography>

          <InstallTabs packages={['@dashforge/ui']} />

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            This installs the core UI framework with all form components and
            intelligent field behavior.
          </Typography>
        </Stack>
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
            Install peer dependencies
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Required dependencies for Material UI integration
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
            Dashforge relies on Material UI and Emotion for styling. Install
            these peer dependencies:
          </Typography>

          <InstallTabs
            packages={['@mui/material', '@emotion/react', '@emotion/styled']}
          />

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            These packages provide the Material UI component foundation and
            CSS-in-JS styling system that Dashforge components extend.
          </Typography>
        </Stack>
      </Stack>

      {/* Optional Packages */}
      <Stack spacing={4} id="package-overview">
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
            Optional packages
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Additional packages in the Dashforge ecosystem
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
            Additional Dashforge packages may include:
          </Typography>

          <Box
            component="ul"
            sx={{
              pl: 4,
              m: 0,
              listStyleType: 'disc',
            }}
          >
            <Box
              component="li"
              sx={{
                fontSize: 16,
                lineHeight: 2,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              <code
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.95em',
                  color: isDark
                    ? 'rgba(139,92,246,0.90)'
                    : 'rgba(109,40,217,0.90)',
                }}
              >
                @dashforge/theme-core
              </code>
            </Box>
            <Box
              component="li"
              sx={{
                fontSize: 16,
                lineHeight: 2,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              <code
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.95em',
                  color: isDark
                    ? 'rgba(139,92,246,0.90)'
                    : 'rgba(109,40,217,0.90)',
                }}
              >
                @dashforge/ui-core
              </code>
            </Box>
          </Box>

          <InstallTabs
            packages={['@dashforge/theme-core', '@dashforge/ui-core']}
          />

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            These are automatically included when installing the full framework
            but can also be installed separately for advanced setups.
          </Typography>
        </Stack>
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
            Verify installation
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Confirm Dashforge is installed correctly
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
            Create a minimal component to verify the installation:
          </Typography>

          <DocsCodeBlock
            code={`import { TextField } from '@dashforge/ui'

function Example() {
  return <TextField label="Name" />
}`}
            language="tsx"
          />

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            If this renders correctly, Dashforge is installed successfully.
          </Typography>
        </Stack>
      </Stack>

      {/* Next Steps */}
      <Stack spacing={3}>
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
            border: isDark
              ? '1px solid rgba(139,92,246,0.20)'
              : '1px solid rgba(139,92,246,0.15)',
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
            Next: Learn How to Use Dashforge
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Now that Dashforge is installed, continue to the{' '}
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
            to learn the basics of building forms with Dashforge.
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
