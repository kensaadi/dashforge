import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { CheckboxFormIntegrationDemo } from './demos/CheckboxFormIntegrationDemo';
import { CheckboxReactiveDemo } from './demos/CheckboxReactiveDemo';

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
 * CheckboxScenarios demonstrates Checkbox in realistic, interactive form contexts
 * Each scenario includes a live demo users can interact with, followed by code
 */
export function CheckboxScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const scenarios: Scenario[] = [
    {
      id: 'react-hook-form-integration',
      title: 'React Hook Form Integration',
      subtitle: 'Try it: Check the boxes and submit the form',
      description:
        'Checkbox integrates seamlessly with React Hook Form through DashForm. Components self-register, errors display automatically after interaction, and validation follows familiar RHF patterns. Try submitting without accepting terms to see validation in action.',
      demo: <CheckboxFormIntegrationDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { Checkbox } from '@dashforge/ui';

function RegistrationForm() {
  const handleSubmit = (data: FormData) => {
    console.log('Submitted:', data);
  };

  return (
    <DashForm
      defaultValues={{ acceptTerms: false, subscribe: false }}
      onSubmit={handleSubmit}
      mode="onBlur"
    >
      <Checkbox
        name="acceptTerms"
        label="I accept the terms and conditions"
        rules={{
          required: 'You must accept the terms to continue'
        }}
      />
      <Checkbox
        name="subscribe"
        label="Subscribe to newsletter (optional)"
      />
      <button type="submit">Submit Registration</button>
    </DashForm>
  );
}

// Checkbox automatically:
// - Registers with React Hook Form
// - Syncs checked value from form state
// - Displays validation errors when touched
// - Tracks touched state on blur`,
      whyItMatters:
        'Gradual adoption: Drop Checkbox into existing form architectures without rewriting validation logic or state management. Perfect for terms acceptance and consent workflows.',
    },
    {
      id: 'reactive-conditional-visibility',
      title: 'Reactive Conditional Visibility',
      subtitle: 'Try it: Select "Business" to see conditional checkbox appear',
      description:
        'Checkbox supports conditional rendering through the visibleWhen prop. Fields render based on engine state—components query field values and make rendering decisions. Select "Business" account type to see the marketing checkbox appear instantly without manual state orchestration. This is part of Dashforge Reactive V2 architecture.',
      demo: <CheckboxReactiveDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { Checkbox, Select } from '@dashforge/ui';

function AccountForm() {
  return (
    <DashForm 
      defaultValues={{ 
        accountType: '', 
        acceptTerms: false,
        acceptMarketing: false 
      }}
    >
      <Select
        name="accountType"
        label="Account Type"
        options={[
          { label: 'Personal', value: 'personal' },
          { label: 'Business', value: 'business' }
        ]}
      />

      <Checkbox
        name="acceptTerms"
        label="I accept the terms and conditions"
        rules={{ required: 'You must accept the terms' }}
      />

      {/* Marketing checkbox: renders only for business accounts */}
      <Checkbox
        name="acceptMarketing"
        label="Send me marketing updates"
        visibleWhen={(engine) => {
          const accountType = engine.getNode('accountType')?.value;
          return accountType === 'business';
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
        'Build adaptive forms where checkbox visibility responds to user input. The component handles conditional rendering—you define the predicate. Perfect for consent workflows that vary by user context.',
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
        Checkbox works in real form contexts, not just isolated demos. Try these
        live scenarios to experience DashForm integration and reactive
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
