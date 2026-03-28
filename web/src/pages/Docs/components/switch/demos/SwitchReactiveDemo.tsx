import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DashForm } from '@dashforge/forms';
import { Switch, Select } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * SwitchReactiveDemo - Demonstrates reactive visibility with switches
 * Shows how switches can conditionally appear based on other field values
 */
export function SwitchReactiveDemo() {
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
          plan: '',
          emailNotifications: false,
          advancedFeatures: false,
        }}
      >
        <Stack spacing={2.5}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
              mb: 0.5,
            }}
          >
            Account Settings
          </Typography>

          <Select
            name="plan"
            label="Subscription Plan"
            fullWidth
            options={[
              { label: 'Free', value: 'free' },
              { label: 'Pro', value: 'pro' },
            ]}
          />

          <Switch name="emailNotifications" label="Email notifications" />

          {/* Advanced features switch only appears for Pro plan */}
          <Switch
            name="advancedFeatures"
            label="Enable advanced features"
            visibleWhen={(engine) => {
              const plan = engine.getNode('plan')?.value;
              return plan === 'pro';
            }}
          />
        </Stack>
      </DashForm>
    </Box>
  );
}
