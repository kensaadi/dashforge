import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { DashForm } from '@dashforge/forms';
import { Select } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

interface FormData {
  country: string;
  language: string;
}

/**
 * SelectFormIntegrationDemo - Live interactive demo of Select with DashForm
 * Users can select options, trigger validation, and submit the form
 */
export function SelectFormIntegrationDemo() {
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
        defaultValues={{ country: '', language: '' }}
        onSubmit={handleSubmit}
        mode="onBlur"
      >
        <Stack spacing={2.5}>
          <Select
            name="country"
            label="Country"
            fullWidth
            rules={{ required: 'Please select a country' }}
            options={[
              { value: 'us', label: 'United States' },
              { value: 'uk', label: 'United Kingdom' },
              { value: 'ca', label: 'Canada' },
              { value: 'au', label: 'Australia' },
              { value: 'de', label: 'Germany' },
            ]}
          />

          <Select
            name="language"
            label="Preferred Language"
            fullWidth
            rules={{ required: 'Please select a language' }}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Spanish' },
              { value: 'fr', label: 'French' },
              { value: 'de', label: 'German' },
              { value: 'zh', label: 'Chinese' },
            ]}
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
            Submit Form
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
                Form submitted successfully!
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
