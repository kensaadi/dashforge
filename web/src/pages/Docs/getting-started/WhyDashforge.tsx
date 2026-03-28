import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../components/shared/CodeBlock';

/**
 * WhyDashforge - Explains the motivation and benefits of using Dashforge
 */
export function WhyDashforge() {
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
          Why Dashforge?
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
          Understand the problems Dashforge solves and why it exists.
        </Typography>
      </Stack>

      {/* The Problem */}
      <Stack spacing={4} id="the-problem">
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
            The Problem
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Building forms is repetitive and error-prone
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{
            fontSize: 16,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          }}
        >
          Forms are everywhere in web applications, yet building them remains
          tedious. Every input field requires manual wiring for state
          management, validation, error display, and submission handling. This
          boilerplate multiplies across every form in your application.
        </Typography>

        <DocsCodeBlock
          code={`// Traditional form with React Hook Form
import { useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';

function LoginForm() {
  const { register, handleSubmit, formState: { errors, touchedFields } } = useForm();
  
  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
            message: 'Invalid email',
          },
        })}
        label="Email"
        error={!!errors.email && touchedFields.email}
        helperText={touchedFields.email ? errors.email?.message : ''}
      />
      
      <TextField
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 8, message: 'Too short' },
        })}
        type="password"
        label="Password"
        error={!!errors.password && touchedFields.password}
        helperText={touchedFields.password ? errors.password?.message : ''}
      />
      
      <button type="submit">Sign In</button>
    </form>
  );
}

// Problems:
// - Manual registration for every field
// - Repetitive error handling logic
// - Touched state tracking boilerplate
// - Easy to forget a prop or make a mistake`}
          language="tsx"
          header={
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
                bgcolor: isDark
                  ? 'rgba(139,92,246,0.15)'
                  : 'rgba(139,92,246,0.10)',
                color: isDark
                  ? 'rgba(139,92,246,0.90)'
                  : 'rgba(109,40,217,0.90)',
                zIndex: 1,
              }}
            >
              Traditional Approach
            </Typography>
          }
        />
      </Stack>

      {/* The Solution */}
      <Stack spacing={4} id="the-solution">
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
            The Solution
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Components that understand forms
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{
            fontSize: 16,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          }}
        >
          Dashforge makes components intelligent. When used inside a DashForm,
          components automatically register themselves, bind to form state,
          display errors appropriately, and track touched state. The boilerplate
          disappears.
        </Typography>

        <DocsCodeBlock
          code={`// Same form with Dashforge
import { DashForm } from '@dashforge/forms';
import { TextField } from '@dashforge/ui';

function LoginForm() {
  const handleSubmit = (data) => {
    console.log(data);
  };

  return (
    <DashForm
      defaultValues={{ email: '', password: '' }}
      onSubmit={handleSubmit}
    >
      <TextField
        name="email"
        label="Email"
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
            message: 'Invalid email',
          },
        }}
      />
      
      <TextField
        name="password"
        label="Password"
        type="password"
        rules={{
          required: 'Password is required',
          minLength: { value: 8, message: 'Too short' },
        }}
      />
      
      <button type="submit">Sign In</button>
    </DashForm>
  );
}

// Benefits:
// - Components auto-register
// - Errors display automatically
// - Touched state handled internally
// - Clean, declarative code`}
          language="tsx"
          header={
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
                bgcolor: isDark
                  ? 'rgba(139,92,246,0.15)'
                  : 'rgba(139,92,246,0.10)',
                color: isDark
                  ? 'rgba(139,92,246,0.90)'
                  : 'rgba(109,40,217,0.90)',
                zIndex: 1,
              }}
            >
              Dashforge Approach
            </Typography>
          }
        />
      </Stack>

      {/* Key Benefits */}
      <Stack spacing={4} id="key-benefits">
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
            Key Benefits
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            What you gain by using Dashforge
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[
            {
              title: 'Less Code',
              description:
                'Eliminate 50-70% of form boilerplate. Components handle registration, error binding, and state management automatically.',
            },
            {
              title: 'Fewer Bugs',
              description:
                'No manual wiring means fewer opportunities for mistakes. Error display, touched state, and validation work correctly by default.',
            },
            {
              title: 'Better Type Safety',
              description:
                'Full TypeScript support throughout. Form values, validation rules, and component props are all strongly typed.',
            },
            {
              title: 'Faster Development',
              description:
                'Build forms faster without sacrificing quality. Focus on business logic instead of form plumbing.',
            },
            {
              title: 'Easier Maintenance',
              description:
                'Forms are more readable and maintainable. Less code means less to understand and fewer places for bugs to hide.',
            },
            {
              title: 'Progressive Enhancement',
              description:
                'Start simple and add features incrementally. Predictive forms and conditional logic are opt-in when you need them.',
            },
          ].map((benefit) => (
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
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: isDark
                      ? 'rgba(255,255,255,0.90)'
                      : 'rgba(15,23,42,0.90)',
                    mb: 1.5,
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
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>

      {/* When to Use */}
      <Stack spacing={4} id="when-to-use">
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
            When to Use Dashforge
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Dashforge is ideal for certain types of applications
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          {[
            {
              title: 'Form-Heavy Applications',
              description:
                'Applications with many forms (admin dashboards, SaaS products, data entry systems) benefit most from Dashforge.',
              good: true,
            },
            {
              title: 'Internal Tools & Dashboards',
              description:
                'Perfect for internal tools where rapid development and maintainability are priorities.',
              good: true,
            },
            {
              title: 'Data-Driven Applications',
              description:
                'Applications focused on data input, editing, and management gain significant productivity improvements.',
              good: true,
            },
            {
              title: 'React + TypeScript Projects',
              description:
                'Teams using React and TypeScript get the most value. Dashforge is built for type safety.',
              good: true,
            },
            {
              title: 'Existing MUI Projects',
              description:
                'If you already use Material-UI, Dashforge integrates seamlessly and extends your existing components.',
              good: true,
            },
          ].map((useCase) => (
            <Box
              key={useCase.title}
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                bgcolor: isDark
                  ? 'rgba(34,197,94,0.08)'
                  : 'rgba(34,197,94,0.05)',
                border: isDark
                  ? '1px solid rgba(34,197,94,0.20)'
                  : '1px solid rgba(34,197,94,0.15)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: isDark
                    ? 'rgba(34,197,94,0.90)'
                    : 'rgba(22,163,74,0.95)',
                  mb: 0.75,
                }}
              >
                ✓ {useCase.title}
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
                {useCase.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>

      {/* Design Philosophy */}
      <Stack spacing={4} id="design-philosophy">
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
            Design Philosophy
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Core principles guiding Dashforge development
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          {[
            {
              principle: 'Convention Over Configuration',
              description:
                'Components work correctly by default. You only configure what differs from the norm.',
            },
            {
              principle: 'Progressive Disclosure',
              description:
                'Start simple, add complexity only when needed. Basic forms are trivial; advanced features are available but optional.',
            },
            {
              principle: 'Type Safety First',
              description:
                'Strong typing throughout. TypeScript is a first-class citizen, not an afterthought.',
            },
            {
              principle: 'Composition Over Inheritance',
              description:
                'Build complex forms from simple, composable pieces. No deep inheritance hierarchies.',
            },
            {
              principle: 'Explicit Over Implicit',
              description:
                'Magic is minimized. Component behavior is predictable and understandable.',
            },
          ].map((item) => (
            <Box
              key={item.principle}
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
                  fontSize: 16,
                  fontWeight: 700,
                  color: isDark
                    ? 'rgba(139,92,246,0.90)'
                    : 'rgba(109,40,217,0.90)',
                  mb: 0.75,
                }}
              >
                {item.principle}
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
                {item.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>

      {/* Get Started */}
      <Stack spacing={3} id="get-started">
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
            Ready to Get Started?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Head to the{' '}
            <Box
              component="a"
              href="/docs/getting-started/installation"
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
              Installation Guide
            </Box>{' '}
            to install Dashforge and start building intelligent forms.
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
