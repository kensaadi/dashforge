import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { DashForm } from '@dashforge/forms';
import { RadioGroup } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

interface FormData {
  shippingMethod: string;
  contactPreference: string;
}

/**
 * RadioGroupFormIntegrationDemo shows RadioGroup with React Hook Form
 * Demonstrates validation, error handling, and form submission
 */
export function RadioGroupFormIntegrationDemo() {
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const handleSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    setSubmittedData(data);
  };

  const shippingOptions = [
    { value: 'standard', label: 'Standard (5-7 days) - Free' },
    { value: 'express', label: 'Express (2-3 days) - $9.99' },
    { value: 'overnight', label: 'Overnight - $24.99' },
  ];

  const contactOptions = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
  ];

  return (
    <Stack spacing={2.5}>
      <DashForm<FormData>
        defaultValues={{
          shippingMethod: '',
          contactPreference: '',
        }}
        onSubmit={handleSubmit}
        mode="onBlur"
      >
        <Stack spacing={3}>
          <RadioGroup
            name="shippingMethod"
            label="Shipping Method"
            options={shippingOptions}
            rules={{
              required: 'Please select a shipping method',
            }}
          />

          <RadioGroup
            name="contactPreference"
            label="Contact Preference"
            options={contactOptions}
            rules={{
              required: 'Please select a contact method',
            }}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              alignSelf: 'flex-start',
              textTransform: 'none',
              bgcolor: isDark ? '#7c3aed' : '#8b5cf6',
              '&:hover': {
                bgcolor: isDark ? '#6d28d9' : '#7c3aed',
              },
            }}
          >
            Complete Order
          </Button>
        </Stack>
      </DashForm>

      {submittedData && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(34,197,94,0.10)' : 'rgba(34,197,94,0.08)',
            border: isDark
              ? '1px solid rgba(34,197,94,0.25)'
              : '1px solid rgba(34,197,94,0.20)',
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: isDark ? '#86efac' : '#16a34a',
              mb: 0.5,
            }}
          >
            Form Submitted Successfully
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              fontFamily: 'monospace',
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            {JSON.stringify(submittedData, null, 2)}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
