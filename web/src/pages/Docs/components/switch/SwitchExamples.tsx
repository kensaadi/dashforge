import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Switch } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * SwitchExamples displays interactive Switch examples
 * Each example shows both the rendered component and its code
 */
export function SwitchExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'Basic',
      description: 'Binary toggle with label for settings',
      code: `<Switch label="Enable notifications" name="notifications" />`,
      component: <Switch label="Enable notifications" name="notifications" />,
    },
    {
      title: 'Checked by Default',
      description: 'Pre-enabled state for default preferences',
      code: `<Switch label="Dark mode" name="darkMode" checked />`,
      component: <Switch label="Dark mode" name="darkMode" defaultChecked />,
    },
    {
      title: 'Disabled',
      description: 'Prevent interaction when locked by policy',
      code: `<Switch label="Beta features" name="beta" disabled />`,
      component: <Switch label="Beta features" name="beta" disabled />,
    },
    {
      title: 'Disabled and On',
      description: 'Show enabled state without toggle control',
      code: `<Switch 
  label="Auto-save (enabled by admin)" 
  name="autoSave" 
  checked 
  disabled 
/>`,
      component: (
        <Switch
          label="Auto-save (enabled by admin)"
          name="autoSave"
          defaultChecked
          disabled
        />
      ),
    },
    {
      title: 'Error State',
      description: 'Validation feedback for required toggles',
      code: `<Switch
  label="Accept privacy policy"
  name="privacy"
  error
  helperText="You must accept the privacy policy"
/>`,
      component: (
        <Switch
          label="Accept privacy policy"
          name="privacy"
          error
          helperText="You must accept the privacy policy"
        />
      ),
    },
    {
      title: 'Without Label',
      description: 'Standalone toggle for compact layouts',
      code: `<Switch name="standalone" />`,
      component: <Switch name="standalone" />,
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
