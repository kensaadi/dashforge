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
      description: 'A simple radio group for account type selection',
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
      description: 'A radio group with a pre-selected option',
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
      description: 'A radio group with horizontal orientation',
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
      description: 'A radio group with one disabled option',
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
      description: 'A radio group displaying an error with helper text',
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
      description: 'A radio group without a form label',
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
    <Stack spacing={3.5}>
      {examples.map((example) => (
        <Box key={example.title}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.5,
                }}
              >
                {example.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  color: isDark
                    ? 'rgba(255,255,255,0.65)'
                    : 'rgba(15,23,42,0.65)',
                }}
              >
                {example.description}
              </Typography>
            </Box>

            <DocsPreviewBlock code={example.code} badge="">
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
