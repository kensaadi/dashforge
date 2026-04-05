import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../components/shared/CodeBlock';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Usage - Practical guide to building forms with Dashforge
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
            fontSize: 20,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            maxWidth: 720,
          }}
        >
          Learn the core patterns for building forms with Dashforge—from basic
          setup to conditional fields and validation.
        </Typography>
      </Stack>

      {/* 1. Set Up Theme Providers */}
      <Stack spacing={4} id="theme-setup">
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
            1. Set up theme providers
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Wrap your app with Dashforge theme providers
          </Typography>
        </Box>

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
}`}
          language="tsx"
        />
      </Stack>

      {/* 2. Create Your First Form */}
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
            2. Create a form with validation
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Basic form with automatic validation and error display
          </Typography>
        </Box>

        <DocsCodeBlock
          code={`import { DashForm } from '@dashforge/forms';
import { TextField } from '@dashforge/ui';

function LoginForm() {
  const handleSubmit = (data) => {
    console.log('Submitted:', data);
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
          minLength: {
            value: 8,
            message: 'At least 8 characters',
          },
        }}
      />

      <button type="submit">Sign In</button>
    </DashForm>
  );
}

// Components self-register
// Errors show after touch or submit
// No Controller needed
// No manual error wiring`}
          language="tsx"
        />
      </Stack>

      {/* 3. Add Conditional Fields */}
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
            3. Add conditional fields
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Show/hide fields based on form state using visibleWhen
          </Typography>
        </Box>

        <DocsCodeBlock
          code={`import { DashForm } from '@dashforge/forms';
import { TextField, Select, Checkbox } from '@dashforge/ui';

function ShippingForm() {
  return (
    <DashForm defaultValues={{
      country: '',
      state: '',
      hasCompany: false,
      companyName: '',
    }}>
      <Select
        name="country"
        label="Country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
        ]}
        rules={{ required: 'Select a country' }}
      />

      {/* State field: only visible for US */}
      <TextField
        name="state"
        label="State"
        visibleWhen={(form) => 
          form.getNode('country')?.value === 'us'
        }
        rules={{ required: 'State required' }}
      />

      <Checkbox
        name="hasCompany"
        label="Shipping to a company?"
      />

      {/* Company name: only visible when checkbox is true */}
      <TextField
        name="companyName"
        label="Company Name"
        visibleWhen={(form) => 
          form.getNode('hasCompany')?.value === true
        }
        rules={{ required: 'Company name required' }}
      />
    </DashForm>
  );
}

// No watch() needed
// No conditional JSX
// Fields show/hide reactively`}
          language="tsx"
        />
      </Stack>

      {/* 4. Custom Validation */}
      <Stack spacing={4} id="custom-validation">
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
            4. Use custom validation
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Write custom validation functions with access to form values
          </Typography>
        </Box>

        <DocsCodeBlock
          code={`<TextField
  name="password"
  label="Password"
  type="password"
  rules={{
    required: 'Password required',
    validate: {
      hasUpperCase: (value) =>
        /[A-Z]/.test(value) || 'Need uppercase letter',
      hasNumber: (value) =>
        /[0-9]/.test(value) || 'Need a number',
      hasSpecial: (value) =>
        /[!@#$%^&*]/.test(value) || 'Need special character',
    },
  }}
/>

<TextField
  name="confirmPassword"
  label="Confirm Password"
  type="password"
  rules={{
    required: 'Confirm password',
    validate: (value, formValues) =>
      value === formValues.password || 'Passwords must match'
  }}
/>`}
          language="tsx"
        />
      </Stack>

      {/* 5. Handle Form Submission */}
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
            5. Handle form submission
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Submit to API with loading states
          </Typography>
        </Box>

        <DocsCodeBlock
          code={`import { useState } from 'react';
import { DashForm } from '@dashforge/forms';
import { TextField } from '@dashforge/ui';

function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Registration successful');
        // Redirect or show success message
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashForm
      defaultValues={{ name: '', email: '' }}
      onSubmit={handleSubmit}
    >
      <TextField
        name="name"
        label="Name"
        rules={{ required: 'Name required' }}
      />
      
      <TextField
        name="email"
        label="Email"
        type="email"
        rules={{ required: 'Email required' }}
      />

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Register'}
      </button>
    </DashForm>
  );
}`}
          language="tsx"
        />
      </Stack>

      {/* Next Steps */}
      <Stack spacing={3} id="next-steps">
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
            Next: Explore Components →
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            See the full component library in the{' '}
            <Box
              component={RouterLink}
              to="/docs/components/text-field"
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
              Components
            </Box>{' '}
            section. Learn about TextField, Select, NumberField, DateTimePicker,
            and more.
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
