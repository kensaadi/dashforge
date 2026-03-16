import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useDashTheme } from '@dashforge/theme-core';
import { Link as RouterLink } from 'react-router-dom';
import { CodeBlock } from '../components/shared/CodeBlock';

/**
 * Overview - Entry point for Getting Started section
 * Explains what Dashforge is as a framework
 */
export function Overview() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const benefits = [
    {
      title: 'MUI-Based Foundation',
      description:
        'Built on Material-UI. All components extend MUI primitives with additional capabilities while maintaining full API compatibility.',
    },
    {
      title: 'Consistent Component APIs',
      description:
        'Unified interface patterns across all components. Same props, same behavior, same integration approach.',
    },
    {
      title: 'Layout System',
      description:
        'Standardized layout variants (standard, compact, dense) that work consistently across all form components.',
    },
    {
      title: 'Form-Friendly Components',
      description:
        'Components self-register with React Hook Form, handle error display, and track touch state automatically.',
    },
    {
      title: 'Predictive UI',
      description:
        'Built-in conditional visibility system. Fields show or hide based on form state without manual orchestration.',
    },
    {
      title: 'Type-Safe',
      description:
        'Full TypeScript support throughout. Strong typing for form values, validation rules, and component contracts.',
    },
  ];

  const buildingBlocks = [
    {
      title: 'Components',
      description:
        'Form inputs, selects, and controls that integrate with the form system automatically.',
      path: '/docs/components/text-field',
    },
    {
      title: 'Layout System',
      description:
        'Consistent layout variants and spacing patterns across all components.',
      path: null, // Not implemented yet
    },
    {
      title: 'Form System',
      description:
        'React Hook Form integration layer with automatic registration and validation.',
      path: null, // Not implemented yet
    },
    {
      title: 'Predictive UI',
      description:
        'Conditional field visibility based on form state using the visibleWhen pattern.',
      path: null, // Not implemented yet
    },
    {
      title: 'Theming',
      description:
        'MUI theme extension system with Dashforge-specific design tokens.',
      path: null, // Not implemented yet
    },
  ];

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
            fontSize: 19,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            maxWidth: 720,
          }}
        >
          Dashforge is a React UI framework built on Material-UI for building
          form-driven applications. It combines consistent component patterns,
          automatic form integration, and predictive behavior into a unified
          system.
        </Typography>
      </Stack>

      {/* What is Dashforge */}
      <Stack spacing={4} id="what-is-dashforge">
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
            What is Dashforge?
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            A framework for building form-heavy interfaces faster
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
            Dashforge eliminates boilerplate in form-driven applications by
            making components intelligent. Instead of manually connecting form
            libraries, wiring validation logic, and orchestrating error display,
            Dashforge components handle it automatically.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            The framework provides a cohesive component system where form fields
            self-register, errors display intelligently based on touch and
            submission state, and field visibility responds to application state
            without manual orchestration.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            The result is less code, better type safety, and predictable
            behavior across complex forms.
          </Typography>
        </Stack>
      </Stack>

      {/* What you get */}
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
            What you get
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Main capabilities provided by the framework
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {benefits.map((benefit) => (
            <Grid size={{ xs: 12, md: 6 }} key={benefit.title}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  bgcolor: isDark
                    ? 'rgba(17,24,39,0.35)'
                    : 'rgba(248,250,252,0.80)',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.06)'
                    : '1px solid rgba(15,23,42,0.08)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isDark
                      ? 'rgba(17,24,39,0.50)'
                      : 'rgba(255,255,255,0.90)',
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

      {/* Built on MUI */}
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
            Built on top of Material-UI
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Extends MUI rather than replacing it
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
            Dashforge is not a component library from scratch. It builds
            directly on Material-UI, extending existing components with
            additional patterns and conventions.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            This means you get MUI's design system, accessibility features, and
            component ecosystem while adding:
          </Typography>

          <Box
            component="ul"
            sx={{
              m: 0,
              pl: 3,
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              '& li': {
                mb: 1,
              },
            }}
          >
            <li>
              <strong>Opinionated component patterns</strong> — consistent APIs
              across all form inputs
            </li>
            <li>
              <strong>Stronger consistency</strong> — layout variants,
              validation rules, and error handling work the same everywhere
            </li>
            <li>
              <strong>Form integration</strong> — automatic React Hook Form
              registration and state management
            </li>
            <li>
              <strong>Predictive behavior</strong> — conditional field
              visibility based on form state
            </li>
            <li>
              <strong>Framework-level conventions</strong> — structured approach
              to building complex forms
            </li>
          </Box>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            All Dashforge components accept standard MUI props. You can use
            MUI's theming system, sx prop, and component customization APIs
            without any modifications.
          </Typography>
        </Stack>
      </Stack>

      {/* Core building blocks */}
      <Stack spacing={4} id="core-building-blocks">
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
            Core building blocks
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Framework areas you'll work with
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {buildingBlocks.map((block) => (
            <Grid size={{ xs: 12, md: 6 }} key={block.title}>
              <Box
                component={block.path ? RouterLink : 'div'}
                to={block.path || undefined}
                sx={{
                  display: 'block',
                  p: 2.5,
                  height: '100%',
                  borderRadius: 1.5,
                  bgcolor: isDark
                    ? 'rgba(17,24,39,0.40)'
                    : 'rgba(248,250,252,0.90)',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(15,23,42,0.10)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: block.path ? 'pointer' : 'default',
                  ...(block.path && {
                    '&:hover': {
                      bgcolor: isDark
                        ? 'rgba(17,24,39,0.55)'
                        : 'rgba(255,255,255,1.0)',
                      borderColor: isDark
                        ? 'rgba(139,92,246,0.30)'
                        : 'rgba(139,92,246,0.25)',
                      transform: 'translateY(-2px)',
                    },
                  }),
                }}
              >
                <Stack spacing={1}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: 17,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      color: isDark
                        ? 'rgba(255,255,255,0.90)'
                        : 'rgba(15,23,42,0.90)',
                    }}
                  >
                    {block.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: isDark
                        ? 'rgba(255,255,255,0.65)'
                        : 'rgba(15,23,42,0.65)',
                    }}
                  >
                    {block.description}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>

      {/* Quick Example */}
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
            Quick example
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            A basic form with automatic validation and error handling
          </Typography>
        </Box>

        <CodeBlock
          code={`import { DashForm } from '@dashforge/forms';
import { TextField, Select } from '@dashforge/ui';

function RegistrationForm() {
  const handleSubmit = (data) => {
    console.log('Form data:', data);
  };

  return (
    <DashForm
      defaultValues={{ name: '', country: '' }}
      onSubmit={handleSubmit}
    >
      <TextField
        name="name"
        label="Full Name"
        rules={{ required: 'Name is required' }}
      />
      
      <Select
        name="country"
        label="Country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
        ]}
        rules={{ required: 'Please select a country' }}
      />
      
      <button type="submit">Submit</button>
    </DashForm>
  );
}

// Components self-register with the form.
// Validation runs automatically.
// Errors display when fields are touched or form is submitted.
// No manual wiring required.`}
          language="tsx"
        />
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
            Recommended reading order
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {[
            {
              title: 'Installation',
              description: 'Install Dashforge packages and set up dependencies',
              link: '/docs/getting-started/installation',
            },
            {
              title: 'Usage',
              description: 'Learn basic patterns and component usage',
              link: '/docs/getting-started/usage',
            },
            {
              title: 'Project Structure',
              description: 'Understand package architecture and organization',
              link: '/docs/getting-started/project-structure',
            },
            {
              title: 'Why Dashforge',
              description:
                'See the problems Dashforge solves and design philosophy',
              link: '/docs/getting-started/why-dashforge',
            },
            {
              title: 'Components',
              description: 'Explore available form components and their APIs',
              link: '/docs/components/text-field',
            },
          ].map((step) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={step.title}
              sx={{
                ...(step.title === 'Components' && {
                  display: { xs: 'none', md: 'block' },
                }),
              }}
            >
              <Box
                component={RouterLink}
                to={step.link}
                sx={{
                  display: 'block',
                  p: 2.5,
                  height: '100%',
                  borderRadius: 1.5,
                  bgcolor: isDark
                    ? 'rgba(139,92,246,0.08)'
                    : 'rgba(139,92,246,0.05)',
                  border: isDark
                    ? '1px solid rgba(139,92,246,0.20)'
                    : '1px solid rgba(139,92,246,0.15)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isDark
                      ? 'rgba(139,92,246,0.12)'
                      : 'rgba(139,92,246,0.08)',
                    borderColor: isDark
                      ? 'rgba(139,92,246,0.35)'
                      : 'rgba(139,92,246,0.25)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Stack spacing={1}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: isDark
                        ? 'rgba(139,92,246,0.95)'
                        : 'rgba(109,40,217,0.95)',
                    }}
                  >
                    {step.title} →
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
