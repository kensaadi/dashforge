import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { SwitchFormIntegrationDemo } from './demos/SwitchFormIntegrationDemo';
import { SwitchReactiveDemo } from './demos/SwitchReactiveDemo';

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
 * SwitchScenarios demonstrates Switch in realistic, interactive form contexts
 * Each scenario includes a live demo users can interact with, followed by code
 */
export function SwitchScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const scenarios: Scenario[] = [
    {
      id: 'react-hook-form-integration',
      title: 'React Hook Form Integration',
      subtitle: 'Try it: Toggle switches and submit preferences',
      description:
        'Switch integrates seamlessly with React Hook Form through DashForm. Components self-register, values sync automatically, and form submission captures all toggle states. Try toggling different notification preferences and submitting the form to see the complete state.',
      demo: <SwitchFormIntegrationDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { Switch } from '@dashforge/ui';

function NotificationPreferences() {
  const handleSubmit = (data: FormData) => {
    console.log('Preferences:', data);
  };

  return (
    <DashForm
      defaultValues={{ 
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: false
      }}
      onSubmit={handleSubmit}
      mode="onBlur"
    >
      <Switch
        name="emailNotifications"
        label="Email notifications"
      />
      <Switch
        name="smsNotifications"
        label="SMS notifications"
      />
      <Switch
        name="pushNotifications"
        label="Push notifications"
      />
      <button type="submit">Save Preferences</button>
    </DashForm>
  );
}

// Switch automatically:
// - Registers with React Hook Form
// - Syncs checked value from form state
// - Returns boolean values on submit
// - Tracks touched state on blur`,
      whyItMatters:
        'Gradual adoption: Drop Switch into existing form architectures without rewriting state management. Perfect for preference panels, feature toggles, and settings screens.',
    },
    {
      id: 'reactive-conditional-visibility',
      title: 'Reactive Conditional Visibility',
      subtitle:
        'Try it: Select "Pro" plan to see advanced features switch appear',
      description:
        'Switch supports conditional rendering through the visibleWhen prop. Fields render based on engine state—components query field values and make rendering decisions. Select "Pro" subscription plan to see the advanced features switch appear instantly without manual state orchestration. This is part of Dashforge Reactive V2 architecture.',
      demo: <SwitchReactiveDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { Switch, Select } from '@dashforge/ui';

function AccountSettings() {
  return (
    <DashForm 
      defaultValues={{ 
        plan: '',
        emailNotifications: false,
        advancedFeatures: false
      }}
    >
      <Select
        name="plan"
        label="Subscription Plan"
        options={[
          { label: 'Free', value: 'free' },
          { label: 'Pro', value: 'pro' }
        ]}
      />

      <Switch
        name="emailNotifications"
        label="Email notifications"
      />

      {/* Advanced features switch: renders only for Pro plan */}
      <Switch
        name="advancedFeatures"
        label="Enable advanced features"
        visibleWhen={(engine) => {
          const plan = engine.getNode('plan')?.value;
          return plan === 'pro';
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
        'Build adaptive settings panels where toggle visibility responds to user selections. The component handles conditional rendering—you define the predicate. Perfect for tiered features and plan-dependent settings.',
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
        Switch works in real form contexts, not just isolated demos. Try these
        live scenarios to experience DashForm integration and reactive
        visibility—both fully implemented and production-ready.
      </Typography>

      <Stack spacing={5}>
        {scenarios.map((scenario, index) => (
          <Box key={scenario.id}>
            <Stack spacing={3}>
              {/* Header */}
              <Box>
                <Typography
                  id={scenario.id}
                  variant="h3"
                  sx={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: isDark
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(15,23,42,0.95)',
                    mb: 0.5,
                  }}
                >
                  {scenario.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: isDark
                      ? 'rgba(139,92,246,0.85)'
                      : 'rgba(109,40,217,0.90)',
                  }}
                >
                  {scenario.subtitle}
                </Typography>
              </Box>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {scenario.description}
              </Typography>

              {/* Live Preview with Collapsible Code */}
              <DocsPreviewBlock code={scenario.code}>
                {scenario.demo}
              </DocsPreviewBlock>

              {/* Why It Matters */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: isDark
                    ? 'rgba(139,92,246,0.08)'
                    : 'rgba(139,92,246,0.05)',
                  border: isDark
                    ? '1px solid rgba(139,92,246,0.20)'
                    : '1px solid rgba(139,92,246,0.15)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDark
                      ? 'rgba(139,92,246,0.90)'
                      : 'rgba(109,40,217,0.95)',
                    mb: 0.5,
                  }}
                >
                  Why it matters
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
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
