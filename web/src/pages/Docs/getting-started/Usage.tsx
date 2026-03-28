import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../components/shared/CodeBlock';

/**
 * Usage - Guide for basic usage of Dashforge components and patterns
 */
export function Usage() {
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
          Usage
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
          Learn the fundamentals of building forms with Dashforge, from basic
          setup to advanced patterns.
        </Typography>
      </Stack>

      {/* Basic Setup */}
      <Stack spacing={4} id="basic-setup">
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
            Basic Setup
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Setting up theme providers and creating your first form
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
              1. Wrap Your App with Theme Providers
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
              Dashforge requires theme providers for styling and component
              behavior:
            </Typography>

            <DocsCodeBlock
              code={`import { DashThemeProvider } from '@dashforge/theme-core';
import { MuiThemeAdapter } from '@dashforge/theme-mui';

function App() {
  return (
    <DashThemeProvider mode="light">
      <MuiThemeAdapter>
        {/* Your app content */}
      </MuiThemeAdapter>
    </DashThemeProvider>
  );
}

export default App;`}
              language="tsx"
            />
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
              2. Create Your First Form
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
              Use DashForm to create a form with automatic state management:
            </Typography>

            <DocsCodeBlock
              code={`import { DashForm } from '@dashforge/forms';
import { TextField } from '@dashforge/ui';

function LoginForm() {
  const handleSubmit = (data) => {
    console.log('Form submitted:', data);
    // { email: 'user@example.com', password: '...' }
  };

  return (
    <DashForm
      defaultValues={{ email: '', password: '' }}
      onSubmit={handleSubmit}
    >
      <TextField
        name="email"
        label="Email"
        type="email"
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        }}
      />

      <TextField
        name="password"
        label="Password"
        type="password"
        rules={{
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters',
          },
        }}
      />

      <button type="submit">Sign In</button>
    </DashForm>
  );
}`}
              language="tsx"
            />
          </Box>
        </Stack>
      </Stack>

      {/* Form Components */}
      <Stack spacing={4} id="form-components">
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
            Form Components
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Available input components and their usage
          </Typography>
        </Box>

        <Stack spacing={3}>
          <DocsCodeBlock
            code={`<TextField
  name="firstName"
  label="First Name"
  placeholder="Enter your first name"
  helperText="This will be displayed on your profile"
  rules={{ required: 'First name is required' }}
/>`}
            language="tsx"
          />

          <DocsCodeBlock
            code={`<NumberField
  name="age"
  label="Age"
  min={18}
  max={120}
  rules={{
    required: 'Age is required',
    min: { value: 18, message: 'Must be 18 or older' },
  }}
/>`}
            language="tsx"
          />

          <DocsCodeBlock
            code={`<Select
  name="country"
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
  ]}
  rules={{ required: 'Please select a country' }}
/>`}
            language="tsx"
          />
        </Stack>
      </Stack>

      {/* Validation */}
      <Stack spacing={4} id="validation">
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
            Validation
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Built-in validation rules and custom validation
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
            Dashforge uses React Hook Form validation rules. Common patterns
            include:
          </Typography>

          <DocsCodeBlock
            code={`<TextField
  name="username"
  label="Username"
  rules={{
    required: 'Username is required',
    minLength: {
      value: 3,
      message: 'Username must be at least 3 characters',
    },
    maxLength: {
      value: 20,
      message: 'Username must be less than 20 characters',
    },
    pattern: {
      value: /^[a-zA-Z0-9_]+$/,
      message: 'Username can only contain letters, numbers, and underscores',
    },
  }}
/>`}
            language="tsx"
          />

          <DocsCodeBlock
            code={`<TextField
  name="password"
  label="Password"
  type="password"
  rules={{
    required: 'Password is required',
    validate: {
      hasUpperCase: (value) =>
        /[A-Z]/.test(value) || 'Must contain at least one uppercase letter',
      hasNumber: (value) =>
        /[0-9]/.test(value) || 'Must contain at least one number',
      hasSpecialChar: (value) =>
        /[!@#$%^&*]/.test(value) || 'Must contain at least one special character',
    },
  }}
/>`}
            language="tsx"
          />
        </Stack>
      </Stack>

      {/* Conditional Fields */}
      <Stack spacing={4} id="conditional-fields">
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
            Conditional Fields
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Show or hide fields based on form state
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
            Use the <code>visibleWhen</code> prop to create dynamic forms:
          </Typography>

          <DocsCodeBlock
            code={`<DashForm defaultValues={{ contactMethod: '', email: '', phone: '' }}>
  <Select
    name="contactMethod"
    label="Preferred Contact Method"
    options={[
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
    ]}
  />

  {/* Email field: visible only when email is selected */}
  <TextField
    name="email"
    label="Email Address"
    type="email"
    visibleWhen={(engine) => {
      const node = engine.getNode('contactMethod');
      return node?.value === 'email';
    }}
  />

  {/* Phone field: visible only when phone is selected */}
  <TextField
    name="phone"
    label="Phone Number"
    type="tel"
    visibleWhen={(engine) => {
      const node = engine.getNode('contactMethod');
      return node?.value === 'phone';
    }}
  />
</DashForm>`}
            language="tsx"
          />
        </Stack>
      </Stack>

      {/* Form Submission */}
      <Stack spacing={4} id="form-submission">
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
            Form Submission
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Handling form submission and async operations
          </Typography>
        </Box>

        <Stack spacing={3}>
          <DocsCodeBlock
            code={`function RegistrationForm() {
  const handleSubmit = (data) => {
    console.log('Submitted data:', data);
    // Send to API
  };

  return (
    <DashForm
      defaultValues={{ name: '', email: '' }}
      onSubmit={handleSubmit}
    >
      <TextField name="name" label="Name" />
      <TextField name="email" label="Email" type="email" />
      <button type="submit">Register</button>
    </DashForm>
  );
}`}
            language="tsx"
          />

          <DocsCodeBlock
            code={`function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        console.log('Registration successful');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashForm
      defaultValues={{ name: '', email: '' }}
      onSubmit={handleSubmit}
    >
      <TextField name="name" label="Name" />
      <TextField name="email" label="Email" type="email" />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Register'}
      </button>
    </DashForm>
  );
}`}
            language="tsx"
          />
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
            Explore Component Documentation
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Learn more about specific components in the{' '}
            <Box
              component="a"
              href="/docs/components/text-field"
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
              UI Components
            </Box>{' '}
            section.
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
