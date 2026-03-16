import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Overview - Introduction page for Getting Started section
 * Explains what Dashforge is and its core value proposition
 */
export function Overview() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const features = [
    {
      title: 'Intelligent Form Components',
      description:
        'Built-in React Hook Form integration. Components self-register, errors display automatically, and validation follows familiar patterns.',
    },
    {
      title: 'Predictive Forms',
      description:
        'Dynamic field visibility based on form state. Build adaptive workflows where fields appear or disappear based on user input.',
    },
    {
      title: 'Type-Safe by Default',
      description:
        'Full TypeScript support throughout. Strong typing for form values, validation rules, and component props.',
    },
    {
      title: 'Built on MUI',
      description:
        'Extends Material-UI components with intelligent behavior while maintaining full compatibility with the MUI ecosystem.',
    },
    {
      title: 'Progressive Adoption',
      description:
        'Start with controlled components, adopt form integration when ready, enable predictive behavior when needed.',
    },
    {
      title: 'Zero Configuration',
      description:
        'Components work out of the box with sensible defaults. No boilerplate, no setup complexity.',
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
          Getting Started
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
          Dashforge is a React UI framework for building intelligent,
          form-driven applications. It combines Material-UI's polished
          components with automatic form integration, predictive behavior, and
          type safety.
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
            A framework for building modern web applications
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
            Dashforge eliminates the complexity of form state management by
            making components intelligent. Instead of manually wiring up form
            libraries, validation, and error handling, Dashforge components
            handle it automatically.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Built on React Hook Form and Material-UI, Dashforge provides a
            cohesive system where form components self-register, errors display
            intelligently, and field visibility responds to application state.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            The result is dramatically less code, better type safety, and forms
            that adapt to user behavior without manual orchestration.
          </Typography>
        </Stack>
      </Stack>

      {/* Key Features Grid */}
      <Stack spacing={4} id="key-features">
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
            Key Features
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Everything you need to build intelligent forms
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid size={{ xs: 12, md: 6 }} key={feature.title}>
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
                    {feature.title}
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
                    {feature.description}
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
            A Quick Example
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            See how simple form building becomes with Dashforge
          </Typography>
        </Box>

        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(0,0,0,0.30)' : 'rgba(248,250,252,0.80)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
          }}
        >
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
                bgcolor: isDark
                  ? 'rgba(255,255,255,0.15)'
                  : 'rgba(15,23,42,0.20)',
                borderRadius: 1,
              },
            }}
          >
            {`import { DashForm } from '@dashforge/forms';
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

// That's it! Components auto-register, errors display automatically,
// validation works out of the box, and touched state is tracked.`}
          </Box>
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
            Next Steps
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {[
            {
              title: 'Installation',
              description: 'Install Dashforge and its dependencies',
              link: '/docs/getting-started/installation',
            },
            {
              title: 'Usage',
              description: 'Learn the basics of working with Dashforge',
              link: '/docs/getting-started/usage',
            },
            {
              title: 'Project Structure',
              description: 'Understand how Dashforge projects are organized',
              link: '/docs/getting-started/project-structure',
            },
          ].map((step) => (
            <Grid size={{ xs: 12, md: 4 }} key={step.title}>
              <Box
                component="a"
                href={step.link}
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
