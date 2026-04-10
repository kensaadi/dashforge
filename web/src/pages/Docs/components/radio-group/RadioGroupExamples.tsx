import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RadioGroup } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * RadioGroupExamples displays interactive RadioGroup examples
 * Each example shows both the rendered component and its code
 */
export function RadioGroupExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const accountTypes = [
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' },
  ];

  const shippingMethods = [
    { value: 'standard', label: 'Standard (5-7 days)' },
    { value: 'express', label: 'Express (2-3 days)' },
    { value: 'overnight', label: 'Overnight' },
  ];

  const planTiers = [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
  ];

  const contactMethods = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'sms', label: 'SMS', disabled: true },
  ];

  const examples: Example[] = [
    {
      title: 'Basic',
      description: 'Single choice from mutually exclusive options',
      code: `<RadioGroup
  name="accountType"
  label="Account Type"
  options={[
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' }
  ]}
/>`,
      component: (
        <RadioGroup
          name="accountType"
          label="Account Type"
          options={accountTypes}
        />
      ),
    },
    {
      title: 'With Default Value',
      description: 'Pre-select an option at render time',
      code: `<RadioGroup
  name="shipping"
  label="Shipping Method"
  defaultValue="standard"
  options={[
    { value: 'standard', label: 'Standard (5-7 days)' },
    { value: 'express', label: 'Express (2-3 days)' },
    { value: 'overnight', label: 'Overnight' }
  ]}
/>`,
      component: (
        <RadioGroup
          name="shipping"
          label="Shipping Method"
          defaultValue="standard"
          options={shippingMethods}
        />
      ),
    },
    {
      title: 'Horizontal Layout',
      description: 'Display options side-by-side with row prop',
      code: `<RadioGroup
  name="plan"
  label="Plan"
  row
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' }
  ]}
/>`,
      component: (
        <RadioGroup name="plan" label="Plan" row options={planTiers} />
      ),
    },
    {
      title: 'With Disabled Option',
      description: 'Restrict specific choices from selection',
      code: `<RadioGroup
  name="contact"
  label="Contact Method"
  options={[
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'sms', label: 'SMS', disabled: true }
  ]}
/>`,
      component: (
        <RadioGroup
          name="contact"
          label="Contact Method"
          options={contactMethods}
        />
      ),
    },
    {
      title: 'Error State',
      description: 'Validation feedback for required selections',
      code: `<RadioGroup
  name="accountError"
  label="Account Type"
  options={[
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' }
  ]}
  error
  helperText="Please select an account type"
/>`,
      component: (
        <RadioGroup
          name="accountError"
          label="Account Type"
          options={accountTypes}
          error
          helperText="Please select an account type"
        />
      ),
    },
    {
      title: 'Without Label',
      description: 'Render options without a group label',
      code: `<RadioGroup
  name="standalone"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
/>`,
      component: (
        <RadioGroup
          name="standalone"
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ]}
        />
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, minmax(0, 1fr))',
        },
        gap: 3,
        alignItems: 'start',
      }}
    >
      {examples.map((example) => (
        <Box
          key={example.title}
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack spacing={1.5}>
            {/* Compact Header */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.25,
                  lineHeight: 1.3,
                }}
              >
                {example.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: isDark
                    ? 'rgba(255,255,255,0.60)'
                    : 'rgba(15,23,42,0.60)',
                }}
              >
                {example.description}
              </Typography>
            </Box>

            {/* Preview Block with Compact Mode */}
            <DocsPreviewBlock code={example.code} badge="" compact>
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
