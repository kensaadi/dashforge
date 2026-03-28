import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { DashForm } from '@dashforge/forms';
import { Checkbox, Select } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * CheckboxReactiveDemo - Demonstrates reactive visibility with checkboxes
 * Shows how checkboxes can conditionally appear based on other field values
 */
export function CheckboxReactiveDemo() {
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
        defaultValues={{
          accountType: '',
          acceptTerms: false,
          acceptMarketing: false,
        }}
      >
        <Stack spacing={2.5}>
          <Select
            name="accountType"
            label="Account Type"
            fullWidth
            options={[
              { label: 'Personal', value: 'personal' },
              { label: 'Business', value: 'business' },
            ]}
          />

          <Checkbox
            name="acceptTerms"
            label="I accept the terms and conditions"
            rules={{
              required: 'You must accept the terms',
            }}
          />

          {/* Marketing checkbox only appears for business accounts */}
          <Checkbox
            name="acceptMarketing"
            label="Send me marketing updates and promotions"
            visibleWhen={(engine) => {
              const accountType = engine.getNode('accountType')?.value;
              return accountType === 'business';
            }}
          />
        </Stack>
      </DashForm>
    </Box>
  );
}
