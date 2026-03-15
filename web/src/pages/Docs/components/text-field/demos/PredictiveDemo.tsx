import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { DashForm } from '@dashforge/forms';
import { TextField, Select } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * PredictiveDemo - Live interactive demo of conditional field visibility
 * Shows fields appearing/disappearing based on form state
 */
export function PredictiveDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

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
        defaultValues={{ contactMethod: '', phone: '', email: '' }}
        mode="onChange"
      >
        <Stack spacing={2.5}>
          <Select
            name="contactMethod"
            label="Preferred Contact Method"
            placeholder="Choose how we should contact you"
            fullWidth
            options={[
              { label: 'Email', value: 'email' },
              { label: 'Phone', value: 'phone' },
            ]}
          />

          {/* Email field: visible only when email is selected */}
          <TextField
            name="email"
            label="Email Address"
            placeholder="your@email.com"
            fullWidth
            rules={{ required: 'Email is required' }}
            visibleWhen={(engine) => {
              const node = engine.getNode('contactMethod');
              return node?.value === 'email';
            }}
          />

          {/* Phone field: visible only when phone is selected */}
          <TextField
            name="phone"
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            fullWidth
            rules={{ required: 'Phone is required' }}
            visibleWhen={(engine) => {
              const node = engine.getNode('contactMethod');
              return node?.value === 'phone';
            }}
          />
        </Stack>
      </DashForm>
    </Box>
  );
}
