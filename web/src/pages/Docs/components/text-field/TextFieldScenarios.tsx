import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { FormIntegrationDemo } from './demos/FormIntegrationDemo';
import { PredictiveDemo } from './demos/PredictiveDemo';

interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  demo: React.ReactNode;
  code: string;
  whyItMatters: string;
}

/**
 * TextFieldScenarios demonstrates TextField in realistic, interactive form contexts
 * Each scenario includes a live demo users can interact with, followed by code
 */
export function TextFieldScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const scenarios: Scenario[] = [
    {
      id: 'react-hook-form-integration',
      title: 'React Hook Form Integration',
      subtitle: 'Try it: Type in the fields and submit the form',
      description:
        'TextField integrates seamlessly with React Hook Form through DashForm. Components self-register, errors display automatically after blur, and validation follows familiar RHF patterns. Try submitting with empty fields or an invalid email.',
      demo: <FormIntegrationDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { TextField } from '@dashforge/ui';

function RegistrationForm() {
  const handleSubmit = (data: FormData) => {
    console.log('Submitted:', data);
  };

  return (
    <DashForm
      defaultValues={{ firstName: '', email: '' }}
      onSubmit={handleSubmit}
      mode="onBlur"
    >
      <TextField
        name="firstName"
        label="First Name"
        rules={{ required: 'Name is required' }}
      />
      <TextField
        name="email"
        label="Email"
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        }}
      />
      <button type="submit">Submit</button>
    </DashForm>
  );
}

// TextField automatically:
// - Registers with React Hook Form
// - Syncs value from form state
// - Displays validation errors when touched
// - Tracks dirty/touched state`,
      whyItMatters:
        'Gradual adoption: Drop TextField into existing form architectures without rewriting validation logic or state management.',
    },
    {
      id: 'reactive-conditional-visibility',
      title: 'Reactive Conditional Visibility',
      subtitle: 'Try it: Select a contact method and watch fields appear',
      description:
        'TextField supports conditional rendering through the visibleWhen prop. Fields render based on engine state—components query field values and make rendering decisions. Select "Email" or "Phone" to see conditional fields appear instantly without manual state orchestration. This is part of Dashforge Reactive V2 architecture.',
      demo: <PredictiveDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { TextField, Select } from '@dashforge/ui';

function ContactForm() {
  return (
    <DashForm defaultValues={{ contactMethod: '', phone: '', email: '' }}>
      <Select
        name="contactMethod"
        label="Preferred Contact Method"
        options={[
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'phone' }
        ]}
      />

      {/* Email field: renders only when email is selected */}
      <TextField
        name="email"
        label="Email Address"
        rules={{ required: 'Email is required' }}
        visibleWhen={(engine) => {
          const node = engine.getNode('contactMethod');
          return node?.value === 'email';
        }}
      />

      {/* Phone field: renders only when phone is selected */}
      <TextField
        name="phone"
        label="Phone Number"
        rules={{ required: 'Phone is required' }}
        visibleWhen={(engine) => {
          const node = engine.getNode('contactMethod');
          return node?.value === 'phone';
        }}
      />
    </DashForm>
  );
}

// The Engine API provides:
// - getNode(name): Access any field's state
// - Component re-renders on dependency changes
// - Component makes rendering decision (engine provides state)`,
      whyItMatters:
        'Build adaptive forms where field visibility responds to user input. The component handles conditional rendering—you define the predicate. No manual state orchestration required.',
    },
  ];

  return (
    <Stack spacing={4}>
      <Typography
        variant="body1"
        sx={{
          fontSize: 15,
          lineHeight: 1.75,
          color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          maxWidth: 720,
        }}
      >
        TextField works in real form contexts, not just isolated demos. Try
        these live scenarios to experience DashForm integration and reactive
        visibility—both fully implemented and production-ready.
      </Typography>

      <Stack spacing={5}>
        {scenarios.map((scenario, index) => (
          <Box key={scenario.id}>
            <Stack spacing={3}>
              {/* Header */}
              <Box>
                <Typography
                  id={scenario.id}
                  variant="h3"
                  sx={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: isDark
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(15,23,42,0.95)',
                    mb: 0.5,
                  }}
                >
                  {scenario.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: isDark
                      ? 'rgba(139,92,246,0.85)'
                      : 'rgba(109,40,217,0.90)',
                  }}
                >
                  {scenario.subtitle}
                </Typography>
              </Box>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {scenario.description}
              </Typography>

              {/* Live Preview with Collapsible Code */}
              <DocsPreviewBlock code={scenario.code}>
                {scenario.demo}
              </DocsPreviewBlock>

              {/* Why It Matters */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: isDark
                    ? 'rgba(139,92,246,0.08)'
                    : 'rgba(139,92,246,0.05)',
                  border: isDark
                    ? '1px solid rgba(139,92,246,0.20)'
                    : '1px solid rgba(139,92,246,0.15)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDark
                      ? 'rgba(139,92,246,0.90)'
                      : 'rgba(109,40,217,0.95)',
                    mb: 0.5,
                  }}
                >
                  Why it matters
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  {scenario.whyItMatters}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
