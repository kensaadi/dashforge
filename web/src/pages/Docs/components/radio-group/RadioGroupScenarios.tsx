import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { RadioGroupFormIntegrationDemo } from './demos/RadioGroupFormIntegrationDemo';
import { RadioGroupReactiveDemo } from './demos/RadioGroupReactiveDemo';

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
 * RadioGroupScenarios demonstrates RadioGroup in realistic, interactive form contexts
 * Each scenario includes a live demo users can interact with, followed by code
 */
export function RadioGroupScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const scenarios: Scenario[] = [
    {
      id: 'react-hook-form-integration',
      title: 'React Hook Form Integration',
      subtitle: 'Try it: Select options and submit the form',
      description:
        'RadioGroup integrates seamlessly with React Hook Form through DashForm. Components self-register, errors display automatically after interaction, and validation follows familiar RHF patterns. Try submitting without selecting options to see validation in action.',
      demo: <RadioGroupFormIntegrationDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { RadioGroup } from '@dashforge/ui';

function CheckoutForm() {
  const handleSubmit = (data: FormData) => {
    console.log('Submitted:', data);
  };

  return (
    <DashForm
      defaultValues={{ 
        shippingMethod: '', 
        contactPreference: '' 
      }}
      onSubmit={handleSubmit}
      mode="onBlur"
    >
      <RadioGroup
        name="shippingMethod"
        label="Shipping Method"
        options={[
          { value: 'standard', label: 'Standard (5-7 days) - Free' },
          { value: 'express', label: 'Express (2-3 days) - $9.99' },
          { value: 'overnight', label: 'Overnight - $24.99' }
        ]}
        rules={{
          required: 'Please select a shipping method'
        }}
      />
      
      <RadioGroup
        name="contactPreference"
        label="Contact Preference"
        options={[
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' }
        ]}
        rules={{
          required: 'Please select a contact method'
        }}
      />
      
      <button type="submit">Complete Order</button>
    </DashForm>
  );
}

// RadioGroup automatically:
// - Registers with React Hook Form
// - Syncs selected value from form state
// - Displays validation errors when touched
// - Tracks touched state on blur`,
      whyItMatters:
        'Gradual adoption: Drop RadioGroup into existing form architectures without rewriting validation logic or state management. Perfect for checkout flows and preference selection.',
    },
    {
      id: 'reactive-conditional-visibility',
      title: 'Reactive Conditional Visibility',
      subtitle:
        'Try it: Select "Business" to see conditional radio group appear',
      description:
        'RadioGroup supports conditional rendering through the visibleWhen prop. Fields render based on engine state—components query field values and make rendering decisions. Select "Business" account type to see the business type radio group appear instantly without manual state orchestration. This is part of Dashforge Reactive V2 architecture.',
      demo: <RadioGroupReactiveDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { RadioGroup, Select } from '@dashforge/ui';

function AccountSetupForm() {
  return (
    <DashForm 
      defaultValues={{ 
        accountType: '', 
        businessType: '',
        contactMethod: ''
      }}
    >
      <Select
        name="accountType"
        label="Account Type"
        options={[
          { value: 'personal', label: 'Personal' },
          { value: 'business', label: 'Business' }
        ]}
      />

      <RadioGroup
        name="contactMethod"
        label="Preferred Contact Method"
        options={[
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'mail', label: 'Mail' }
        ]}
      />

      {/* Business type: renders only for business accounts */}
      <RadioGroup
        name="businessType"
        label="Business Type"
        options={[
          { value: 'sole-proprietor', label: 'Sole Proprietor' },
          { value: 'llc', label: 'LLC' },
          { value: 'corporation', label: 'Corporation' }
        ]}
        visibleWhen={(engine) => {
          const accountType = engine.getNode('accountType')?.value;
          return accountType === 'business';
        }}
        rules={{
          required: 'Please select a business type'
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
        'Build adaptive forms where radio group visibility responds to user input. The component handles conditional rendering—you define the predicate. Perfect for multi-step flows that branch based on user choices.',
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
        RadioGroup works in real form contexts, not just isolated demos. Try
        these live scenarios to experience DashForm integration and reactive
        visibility—both fully implemented and production-ready.
      </Typography>

      <Stack spacing={5}>
        {scenarios.map((scenario, index) => (
          <Box key={scenario.id}>
            <Stack spacing={3}>
              {/* Header */}
              <Box>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 0.75,
                      bgcolor: isDark
                        ? 'rgba(139,92,246,0.15)'
                        : 'rgba(139,92,246,0.10)',
                      border: isDark
                        ? '1px solid rgba(139,92,246,0.30)'
                        : '1px solid rgba(139,92,246,0.25)',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: isDark ? '#c4b5fd' : '#7c3aed',
                      }}
                    >
                      Scenario {index + 1}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: isDark
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(15,23,42,0.95)',
                    mb: 0.5,
                  }}
                >
                  {scenario.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: isDark ? '#a78bfa' : '#7c3aed',
                    mb: 1.5,
                  }}
                >
                  {scenario.subtitle}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  {scenario.description}
                </Typography>
              </Box>

              {/* Live Preview with Collapsible Code */}
              <DocsPreviewBlock code={scenario.code} badge="Full Example">
                {scenario.demo}
              </DocsPreviewBlock>

              {/* Why It Matters */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 1.5,
                  bgcolor: isDark
                    ? 'rgba(59,130,246,0.08)'
                    : 'rgba(59,130,246,0.06)',
                  border: isDark
                    ? '1px solid rgba(59,130,246,0.20)'
                    : '1px solid rgba(59,130,246,0.15)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDark ? '#93c5fd' : '#2563eb',
                    mb: 0.75,
                  }}
                >
                  Why This Matters
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.7,
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
