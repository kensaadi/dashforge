import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { DashForm } from '@dashforge/forms';
import { Checkbox } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

interface FormData {
  acceptTerms: boolean;
  subscribe: boolean;
}

/**
 * CheckboxFormIntegrationDemo - Live interactive demo of Checkbox with DashForm
 * Users can check boxes, trigger validation, and submit the form
 */
export function CheckboxFormIntegrationDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const handleSubmit = (data: unknown) => {
    setSubmittedData(data as FormData);
  };

  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(248,250,252,0.60)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
      }}
    >
      <DashForm
        defaultValues={{ acceptTerms: false, subscribe: false }}
        onSubmit={handleSubmit}
        mode="onBlur"
      >
        <Stack spacing={2.5}>
          <Checkbox
            name="acceptTerms"
            label="I accept the terms and conditions"
            rules={{
              required: 'You must accept the terms to continue',
            }}
          />
          <Checkbox
            name="subscribe"
            label="Subscribe to newsletter (optional)"
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: isDark
                ? 'rgba(139,92,246,0.85)'
                : 'rgba(109,40,217,0.90)',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              py: 1.25,
              '&:hover': {
                bgcolor: isDark
                  ? 'rgba(139,92,246,0.95)'
                  : 'rgba(109,40,217,1)',
              },
            }}
          >
            Submit Registration
          </Button>

          {submittedData && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: isDark
                  ? 'rgba(34,197,94,0.12)'
                  : 'rgba(34,197,94,0.08)',
                border: isDark
                  ? '1px solid rgba(34,197,94,0.25)'
                  : '1px solid rgba(34,197,94,0.20)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(34,197,94,0.90)'
                    : 'rgba(22,163,74,0.95)',
                  mb: 0.5,
                }}
              >
                Registration submitted successfully!
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {JSON.stringify(submittedData, null, 2)}
              </Typography>
            </Box>
          )}
        </Stack>
      </DashForm>
    </Box>
  );
}
