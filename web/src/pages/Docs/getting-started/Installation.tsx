import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Installation - Guide for installing Dashforge and its dependencies
 */
export function Installation() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const CodeBlock = ({
    children,
    label,
  }: {
    children: string;
    label?: string;
  }) => (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(0,0,0,0.30)' : 'rgba(248,250,252,0.80)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
        position: 'relative',
      }}
    >
      {label && (
        <Typography
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontSize: 11,
            fontWeight: 600,
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            bgcolor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.10)',
            color: isDark ? 'rgba(139,92,246,0.90)' : 'rgba(109,40,217,0.90)',
          }}
        >
          {label}
        </Typography>
      )}
      <Box
        component="pre"
        sx={{
          m: 0,
          fontSize: 14,
          lineHeight: 1.7,
          fontFamily: '"Fira Code", "SF Mono", Menlo, monospace',
          color: isDark ? '#e5e7eb' : '#1f2937',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.20)',
            borderRadius: 1,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );

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
          Install Dashforge and its peer dependencies to get started building
          intelligent forms.
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
            Requirements before installing Dashforge
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
          <Stack spacing={2}>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              <strong>Node.js:</strong> Version 18.0.0 or higher
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              <strong>React:</strong> Version 18.0.0 or higher
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              <strong>Package Manager:</strong> npm, yarn, or pnpm
            </Typography>
          </Stack>
        </Box>
      </Stack>

      {/* Installation Steps */}
      <Stack spacing={4} id="installation-steps">
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
            Installation
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Install Dashforge packages with your preferred package manager
          </Typography>
        </Box>

        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 2,
              }}
            >
              Core Packages
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
                mb: 3,
              }}
            >
              Install the core Dashforge packages for form management and UI
              components:
            </Typography>

            <Stack spacing={2}>
              <CodeBlock label="npm">
                {`npm install @dashforge/forms @dashforge/ui @dashforge/theme-core @dashforge/theme-mui`}
              </CodeBlock>

              <CodeBlock label="yarn">
                {`yarn add @dashforge/forms @dashforge/ui @dashforge/theme-core @dashforge/theme-mui`}
              </CodeBlock>

              <CodeBlock label="pnpm">
                {`pnpm add @dashforge/forms @dashforge/ui @dashforge/theme-core @dashforge/theme-mui`}
              </CodeBlock>
            </Stack>
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 2,
              }}
            >
              Peer Dependencies
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
                mb: 3,
              }}
            >
              Dashforge requires Material-UI and React Hook Form as peer
              dependencies:
            </Typography>

            <Stack spacing={2}>
              <CodeBlock label="npm">
                {`npm install @mui/material @emotion/react @emotion/styled react-hook-form`}
              </CodeBlock>

              <CodeBlock label="yarn">
                {`yarn add @mui/material @emotion/react @emotion/styled react-hook-form`}
              </CodeBlock>

              <CodeBlock label="pnpm">
                {`pnpm add @mui/material @emotion/react @emotion/styled react-hook-form`}
              </CodeBlock>
            </Stack>
          </Box>
        </Stack>
      </Stack>

      {/* Package Overview */}
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
            Package Overview
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Understanding the Dashforge package ecosystem
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          {[
            {
              name: '@dashforge/forms',
              description:
                'Form management system built on React Hook Form. Provides DashForm component and form bridge architecture.',
            },
            {
              name: '@dashforge/ui',
              description:
                'Intelligent UI components (TextField, Select, NumberField, etc.) with automatic form integration.',
            },
            {
              name: '@dashforge/theme-core',
              description:
                'Core theming system providing theme context and utilities for component styling.',
            },
            {
              name: '@dashforge/theme-mui',
              description:
                'Material-UI theme adapter. Connects Dashforge theme system to MUI components.',
            },
            {
              name: '@dashforge/ui-core',
              description:
                'Internal package providing engine, bridge contracts, and predictive form capabilities. Automatically installed as a dependency.',
            },
          ].map((pkg) => (
            <Box
              key={pkg.name}
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                bgcolor: isDark
                  ? 'rgba(17,24,39,0.35)'
                  : 'rgba(248,250,252,0.80)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.06)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: isDark
                    ? 'rgba(139,92,246,0.90)'
                    : 'rgba(109,40,217,0.90)',
                  mb: 1,
                }}
              >
                {pkg.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {pkg.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>

      {/* Verification */}
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
            Verify Installation
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Check that Dashforge is installed correctly
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
            Create a simple test component to verify the installation:
          </Typography>

          <CodeBlock>
            {`import { DashForm } from '@dashforge/forms';
import { TextField } from '@dashforge/ui';

function TestComponent() {
  return (
    <DashForm defaultValues={{ name: '' }} onSubmit={(data) => console.log(data)}>
      <TextField name="name" label="Name" />
      <button type="submit">Submit</button>
    </DashForm>
  );
}

export default TestComponent;`}
          </CodeBlock>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            If the component renders without errors, Dashforge is installed
            correctly.
          </Typography>
        </Stack>
      </Stack>

      {/* Next Steps */}
      <Stack spacing={3} id="next-steps">
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
              component="a"
              href="/docs/getting-started/usage"
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
            to learn the basics of building forms.
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
