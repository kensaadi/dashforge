import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../components/shared/CodeBlock';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Usage - Guided onboarding for building forms with Dashforge
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
          Build your first form. Add validation. Make fields conditional. Handle
          submission. Each step builds on the last.
        </Typography>
      </Stack>

      {/* 1. Quick Setup */}
      <Stack spacing={4} id="theme-setup">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 26, md: 32 },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
              mb: 1.5,
            }}
          >
            1. Add the required providers
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(15,23,42,0.60)',
            }}
          >
            Quick one-time setup
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

      {/* 2. Your First Form */}
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
            2. Your first form
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Fields register themselves. Validation runs automatically. Errors
            display on touch.
          </Typography>
        </Box>

        <DocsCodeBlock
          code={`import { DashForm } from '@dashforge/forms';
import { TextField, Button } from '@dashforge/ui';

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

      <Button type="submit" variant="contained">
        Sign In
      </Button>
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
            bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
            border: isDark
              ? '1px solid rgba(139,92,246,0.20)'
              : '1px solid rgba(139,92,246,0.15)',
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.6,
              color: isDark ? 'rgba(139,92,246,0.90)' : 'rgba(109,40,217,0.90)',
              fontWeight: 500,
            }}
          >
            No Controller. No manual error wiring. No watch() for touched state.
          </Typography>
        </Box>
      </Stack>

      {/* 3. Conditional Fields */}
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
            3. Make fields conditional
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            No watch() or conditional JSX. Fields react to form state
            automatically.
          </Typography>
        </Box>

        <DocsCodeBlock
          code={`import { DashForm } from '@dashforge/forms';
import { TextField, Select, Checkbox, Button } from '@dashforge/ui';

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

      <Button type="submit" variant="contained">
        Continue
      </Button>
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
            bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
            border: isDark
              ? '1px solid rgba(139,92,246,0.20)'
              : '1px solid rgba(139,92,246,0.15)',
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.6,
              color: isDark ? 'rgba(139,92,246,0.90)' : 'rgba(109,40,217,0.90)',
              fontWeight: 500,
            }}
          >
            The dependency lives on the field. No scattered watch() calls in the
            parent.
          </Typography>
        </Box>
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
            4. Write custom validation
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Same validation API as React Hook Form. Access form values without
            manual wiring.
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
      value === formValues.password || 'Passwords must match',
  }}
/>`}
          language="tsx"
        />
      </Stack>

      {/* 5. Handle Submission */}
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
            5. Submit to your API
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Handle async submission with loading states and error handling
          </Typography>
        </Box>

        <DocsCodeBlock
          code={`import { useState } from 'react';
import { DashForm } from '@dashforge/forms';
import { TextField, Button } from '@dashforge/ui';

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
        // Redirect or show success
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

      <Button 
        type="submit" 
        variant="contained"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Register'}
      </Button>
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
            You know the patterns
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
            Now explore the full component library: TextField, Select,
            NumberField, DateTimePicker, Checkbox, RadioGroup, and more.
          </Typography>
          <Box
            component={RouterLink}
            to="/docs/components/text-field"
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
            Component Library →
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
}
