import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useDashTheme } from '@dashforge/theme-core';
import { Link as RouterLink } from 'react-router-dom';
import { DocsCodeBlock } from '../components/shared/CodeBlock';

/**
 * Overview - Onboarding entry point for Getting Started
 * Focused on fast comprehension and first mental model
 */
export function Overview() {
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
          Overview
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
          Dashforge is a React form framework built on MUI and React Hook Form.
          It eliminates integration boilerplate through form-aware components
          that handle registration, validation, and error display automatically.
        </Typography>
      </Stack>

      {/* Quick Example - Moved Way Up */}
      <Stack spacing={4} id="quick-example">
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
            What it looks like
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            A form with validation and conditional fields
          </Typography>
        </Box>

        <DocsCodeBlock
          code={`import { DashForm } from '@dashforge/forms';
import { TextField, Select } from '@dashforge/ui';

function ContactForm() {
  return (
    <DashForm
      defaultValues={{ method: '', email: '', phone: '' }}
      onSubmit={(data) => console.log(data)}
    >
      <Select
        name="method"
        label="Contact Method"
        options={[
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
        ]}
        rules={{ required: 'Choose a method' }}
      />

      {/* Appears only when email is selected */}
      <TextField
        name="email"
        label="Email Address"
        type="email"
        visibleWhen={(form) => 
          form.getNode('method')?.value === 'email'
        }
        rules={{ required: 'Email required' }}
      />

      {/* Appears only when phone is selected */}
      <TextField
        name="phone"
        label="Phone Number"
        visibleWhen={(form) => 
          form.getNode('method')?.value === 'phone'
        }
        rules={{ required: 'Phone required' }}
      />
    </DashForm>
  );
}

// No Controller wrappers
// No watch() hooks
// No manual error wiring
// Validation runs automatically
// Errors show when touched or submitted`}
          language="tsx"
        />
      </Stack>

      {/* What You Get - Condensed to 3 cards */}
      <Stack spacing={4} id="what-you-get">
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
            What Dashforge gives you
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[
            {
              title: 'No form integration boilerplate',
              description:
                'Components self-register with React Hook Form. No Controller wrappers, no manual error wiring, no watch() for reactive values.',
            },
            {
              title: 'Declarative conditional fields',
              description:
                'Use visibleWhen prop instead of conditional JSX. Fields show/hide based on form state without manual orchestration.',
            },
            {
              title: 'Smart error handling',
              description:
                'Errors display only after touch or submit (Form Closure v1). Validation rules use React Hook Form API directly.',
            },
          ].map((benefit) => (
            <Grid size={{ xs: 12, md: 4 }} key={benefit.title}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  bgcolor: isDark
                    ? 'rgba(17,24,39,0.40)'
                    : 'rgba(248,250,252,0.90)',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(15,23,42,0.10)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isDark
                      ? 'rgba(17,24,39,0.55)'
                      : 'rgba(255,255,255,0.95)',
                    borderColor: isDark
                      ? 'rgba(139,92,246,0.30)'
                      : 'rgba(139,92,246,0.25)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Stack spacing={1.5}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      color: isDark
                        ? 'rgba(255,255,255,0.90)'
                        : 'rgba(15,23,42,0.90)',
                    }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: isDark
                        ? 'rgba(255,255,255,0.70)'
                        : 'rgba(15,23,42,0.70)',
                    }}
                  >
                    {benefit.description}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>

      {/* Built on MUI - Condensed */}
      <Stack spacing={4} id="built-on-mui">
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
            Built on Material-UI
          </Typography>
        </Box>

        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(17,24,39,0.35)' : 'rgba(248,250,252,0.80)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(15,23,42,0.08)',
          }}
        >
          <Stack spacing={3}>
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
              Dashforge extends MUI components with form integration rather than
              replacing them. You keep MUI's design system, accessibility, and
              ecosystem.
            </Typography>

            <Box
              component="ul"
              sx={{
                m: 0,
                pl: 3,
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
                '& li': {
                  mb: 1,
                },
              }}
            >
              <li>All MUI props still work (sx, variant, size, etc.)</li>
              <li>MUI theming system fully compatible</li>
              <li>
                Dashforge adds: automatic form registration, validation
                handling, conditional visibility
              </li>
            </Box>
          </Stack>
        </Box>
      </Stack>

      {/* Next Steps */}
      <Stack spacing={4} id="next-steps">
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
            Next steps
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Start building with Dashforge
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {[
            {
              title: 'Installation',
              description: 'Install packages and set up dependencies',
              link: '/docs/getting-started/installation',
              primary: true,
            },
            {
              title: 'Usage',
              description: 'Build your first form with step-by-step examples',
              link: '/docs/getting-started/usage',
              primary: true,
            },
            {
              title: 'Why Dashforge',
              description: 'Understand the problems it solves',
              link: '/docs/getting-started/why-dashforge',
              primary: false,
            },
          ].map((step) => (
            <Grid size={{ xs: 12, md: step.primary ? 6 : 12 }} key={step.title}>
              <Box
                component={RouterLink}
                to={step.link}
                sx={{
                  display: 'block',
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  bgcolor: step.primary
                    ? isDark
                      ? 'rgba(139,92,246,0.10)'
                      : 'rgba(139,92,246,0.06)'
                    : isDark
                    ? 'rgba(17,24,39,0.40)'
                    : 'rgba(248,250,252,0.90)',
                  border: step.primary
                    ? isDark
                      ? '1px solid rgba(139,92,246,0.25)'
                      : '1px solid rgba(139,92,246,0.18)'
                    : isDark
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(15,23,42,0.10)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: step.primary
                      ? isDark
                        ? 'rgba(139,92,246,0.15)'
                        : 'rgba(139,92,246,0.10)'
                      : isDark
                      ? 'rgba(17,24,39,0.55)'
                      : 'rgba(255,255,255,1.0)',
                    borderColor: isDark
                      ? 'rgba(139,92,246,0.40)'
                      : 'rgba(139,92,246,0.30)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Stack spacing={1.5}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: step.primary
                        ? isDark
                          ? 'rgba(139,92,246,0.95)'
                          : 'rgba(109,40,217,0.95)'
                        : isDark
                        ? 'rgba(255,255,255,0.90)'
                        : 'rgba(15,23,42,0.90)',
                    }}
                  >
                    {step.title} →
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: isDark
                        ? 'rgba(255,255,255,0.70)'
                        : 'rgba(15,23,42,0.70)',
                    }}
                  >
                    {step.description}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
}
