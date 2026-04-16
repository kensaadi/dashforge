import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { OTPField } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { useState } from 'react';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * OTPFieldExamples displays interactive OTPField examples
 * Each example shows both the rendered component and its code
 */
export function OTPFieldExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  // Controlled example state
  const [controlledValue, setControlledValue] = useState('');
  const [completedValue, setCompletedValue] = useState('');

  const examples: Example[] = [
    {
      title: 'Basic Numeric',
      description: 'Standard 6-digit OTP for verification codes',
      code: `<OTPField name="otp" length={6} />`,
      component: <OTPField name="basic-otp" length={6} />,
    },
    {
      title: 'Short 4-Digit',
      description: '4-digit PIN code entry',
      code: `<OTPField name="pin" length={4} />`,
      component: <OTPField name="pin" length={4} />,
    },
    {
      title: 'Alphanumeric Mode',
      description: 'Accept letters and numbers for complex codes',
      code: `<OTPField
  name="token"
  length={6}
  mode="alphanumeric"
/>`,
      component: <OTPField name="token" length={6} mode="alphanumeric" />,
    },
    {
      title: 'Alpha Only',
      description: 'Letter-only verification codes',
      code: `<OTPField
  name="code"
  length={4}
  mode="alpha"
/>`,
      component: <OTPField name="code" length={4} mode="alpha" />,
    },
    {
      title: 'With Label',
      description: 'Display a label above the OTP slots',
      code: `<OTPField
  name="verification"
  length={6}
  label="Enter verification code"
/>`,
      component: (
        <OTPField
          name="verification"
          length={6}
          label="Enter verification code"
        />
      ),
    },
    {
      title: 'Error State',
      description: 'Show validation errors',
      code: `<OTPField
  name="invalid"
  length={6}
  error
  helperText="Invalid code. Please try again."
/>`,
      component: (
        <OTPField
          name="invalid"
          length={6}
          error
          helperText="Invalid code. Please try again."
        />
      ),
    },
    {
      title: 'Controlled',
      description: 'Manage state externally with value/onChange',
      code: `const [value, setValue] = useState('');

<OTPField
  name="controlled"
  length={6}
  value={value}
  onChange={setValue}
/>`,
      component: (
        <Box>
          <OTPField
            name="controlled"
            length={6}
            value={controlledValue}
            onChange={setControlledValue}
          />
          <Typography
            sx={{
              mt: 1,
              fontSize: 12,
              color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(15,23,42,0.60)',
            }}
          >
            Current value: {controlledValue || '(empty)'}
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Completion Callback',
      description: 'Fire callback when all slots are filled',
      code: `const [completed, setCompleted] = useState('');

<OTPField
  name="complete"
  length={6}
  onComplete={setCompleted}
/>`,
      component: (
        <Box>
          <OTPField name="complete" length={6} onComplete={setCompletedValue} />
          <Typography
            sx={{
              mt: 1,
              fontSize: 12,
              color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(15,23,42,0.60)',
            }}
          >
            {completedValue
              ? `Completed with: ${completedValue}`
              : 'Fill all slots to trigger callback'}
          </Typography>
        </Box>
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
